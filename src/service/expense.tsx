import { getAuth } from '@react-native-firebase/auth';
import {
    addDoc,
    collection,
    getFirestore,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
    Timestamp,
} from '@react-native-firebase/firestore';

const db = getFirestore();

export type ExpenseCategory = 'food' | 'travel' | 'stay' | 'bills' | 'fun' | 'settlement';
export type SplitMode = 'equal' | 'custom';

// In the app, amounts are integer satang (no float errors). In Firestore they are stored in baht (1000.00).
const toBaht = (satang: number) => satang / 100;
const toSatang = (baht: number) => Math.round(baht * 100);

export type ExpenseInput = {
    description: string;
    category: ExpenseCategory;
    amount: number; // satang in the app (1 THB = 100), positive integer; stored in baht
    paidBy: string; // uid
    splitMode: SplitMode;
    splits: Record<string, number>; // uid -> share in satang, must sum to amount; stored in baht
};

// Split `total` between `uids`, handing the leftover satang out one by one so the sum is exact
export function splitEqually(total: number, uids: string[]): Record<string, number> {
    if (uids.length === 0) return {};
    const base = Math.floor(total / uids.length);
    let rest = total - base * uids.length;
    return Object.fromEntries(uids.map((uid) => [uid, base + (rest-- > 0 ? 1 : 0)]));
}

export type ExpenseDoc = ExpenseInput & {
    createdBy: string; // uid, set by createExpense
    createdAt: Timestamp | null; // null right after creating
};

export type ExpenseProps = ExpenseDoc & { id: string }; // id is the doc id, not stored in the doc

export async function createExpense(groupId: string, expense: ExpenseInput) {
    const user = getAuth().currentUser;
    if (!user) throw new Error('Not signed in');

    const splitTotal = Object.values(expense.splits).reduce((a, b) => a + b, 0);
    if (expense.amount <= 0) throw new Error('Expense amount must be greater than 0');
    if (splitTotal !== expense.amount) throw new Error('Splits must add up to the total');
    try {
        const expenseRef = addDoc(collection(db, 'groups', groupId, 'expenses'), {
            description: expense.description.trim(),
            category: expense.category,
            amount: toBaht(expense.amount),
            paidBy: expense.paidBy,
            splitMode: expense.splitMode,
            splits: Object.fromEntries(
                Object.entries(expense.splits).map(([uid, share]) => [uid, toBaht(share)]),
            ),
            createdBy: user.uid,
            createdAt: serverTimestamp(),
        });
        return (await expenseRef).id;
    } catch (error) {
        console.error('Error creating expense: ', error);
        throw error;
    }
}

// A settlement is stored as an expense where the payer covers the payee's whole share,
// so the balance math cancels the debt out without any special casing.
export function createSettlement(
    groupId: string,
    { payerId, payeeId, amount }: { payerId: string; payeeId: string; amount: number }, // satang
) {
    return createExpense(groupId, {
        description: 'Settle up',
        category: 'settlement',
        amount,
        paidBy: payerId,
        splitMode: 'custom',
        splits: { [payeeId]: amount },
    });
}

// Listen to a group's expenses (real-time), newest first
export function subscribeToExpenses(
    groupId: string,
    onChange: (expenses: ExpenseProps[]) => void,
    onError?: (error: Error) => void,
) {
    const q = query(collection(db, 'groups', groupId, 'expenses'), orderBy('createdAt', 'desc'));

    return onSnapshot(
        q,
        (snapshot) => {
            onChange(
                (snapshot?.docs ?? []).map((d) => {
                    const data = d.data() as ExpenseDoc;
                    return {
                        id: d.id,
                        ...data,
                        amount: toSatang(data.amount),
                        splits: Object.fromEntries(
                            Object.entries(data.splits ?? {}).map(([uid, v]) => [uid, toSatang(v)]),
                        ),
                    };
                }),
            );
        },
        (error) => {
            console.warn('Failed to listen to expenses', error);
            onError?.(error);
        },
    );
}

export type MyBalance = {
    overall: number; // owedToYou - youOwe
    youOwe: number;
    owedToYou: number; // all in satang
};

// My net balance against each other member (satang): positive = they owe me, negative = I owe them
export function computeNetByMember(
    expenses: ExpenseProps[],
    myUid: string,
): Record<string, number> {
    const net: Record<string, number> = {};

    for (const e of expenses) {
        if (e.paidBy === myUid) {
            for (const [uid, share] of Object.entries(e.splits)) {
                if (uid !== myUid) net[uid] = (net[uid] ?? 0) + share;
            }
        } else {
            const myShare = e.splits[myUid] ?? 0;
            net[e.paidBy] = (net[e.paidBy] ?? 0) - myShare;
        }
    }
    return net;
}

// Net my balance against each other member, then add up what I owe and what I'm owed
export function computeMyBalance(expenses: ExpenseProps[], myUid: string): MyBalance {
    const net = computeNetByMember(expenses, myUid);

    let owedToYou = 0;
    let youOwe = 0;
    for (const v of Object.values(net)) {
        if (v > 0) owedToYou += v;
        else youOwe -= v;
    }
    return { overall: owedToYou - youOwe, youOwe, owedToYou };
}
