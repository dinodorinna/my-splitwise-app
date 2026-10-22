import { useEffect, useMemo, useState } from 'react';
import { ExpenseProps, subscribeToExpenses } from '../../service/expense';

// Listen to the expenses of several groups at once, merged into one list
export function useAllGroupsExpenses(groupIds: string[]) {
    const [byGroup, setByGroup] = useState<Record<string, ExpenseProps[]>>({});
    const key = groupIds.join(',');

    useEffect(() => {
        setByGroup({});
        const unsubscribes = groupIds.map((id) =>
            subscribeToExpenses(id, (list) => setByGroup((prev) => ({ ...prev, [id]: list }))),
        );
        return () => unsubscribes.forEach((unsubscribe) => unsubscribe());
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [key]);

    const expenses = useMemo(() => Object.values(byGroup).flat(), [byGroup]);
    return { expenses };
}
