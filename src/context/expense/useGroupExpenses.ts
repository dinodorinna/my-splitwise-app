import { useEffect, useState } from 'react';
import { ExpenseProps, subscribeToExpenses } from '../../service/expense';

export function useGroupExpenses(groupId?: string) {
    const [expenses, setExpenses] = useState<ExpenseProps[]>([]);
    const [loading, setLoading] = useState(!!groupId);

    useEffect(() => {
        if (!groupId) {
            setExpenses([]);
            setLoading(false);
            return;
        }
        setLoading(true);
        return subscribeToExpenses(
            groupId,
            (list) => {
                setExpenses(list);
                setLoading(false);
            },
            () => {
                setExpenses([]);
                setLoading(false);
            },
        );
    }, [groupId]);

    return { expenses, loading };
}
