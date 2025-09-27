
'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { DollarSign, Building, Users, Loader2 } from "lucide-react";
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, collectionGroup, getDocs, query, CollectionReference, DocumentData } from 'firebase/firestore';
import { useEffect, useState } from "react";

interface Tenant {
    id: string;
    name: string;
    status: 'active' | 'suspended' | 'inactive';
}

export default function SuperAdminDashboardPage() {
    const firestore = useFirestore();
    const [userCount, setUserCount] = useState<number | null>(null);
    const [isLoadingUserCount, setIsLoadingUserCount] = useState(true);

    const tenantsCollectionRef = useMemoFirebase(() => {
        if (!firestore) return null;
        return collection(firestore, 'tenants');
    }, [firestore]);

    const { data: tenants, isLoading: isLoadingTenants, error } = useCollection<Tenant>(tenantsCollectionRef as CollectionReference<DocumentData> | null);

    useEffect(() => {
      async function fetchUserCount() {
        if (!firestore) return;
        setIsLoadingUserCount(true);
        try {
            const usersQuery = query(collectionGroup(firestore, 'users'));
            const snapshot = await getDocs(usersQuery);
            setUserCount(snapshot.size);
        } catch (err) {
            console.error("Error fetching total user count:", err);
            setUserCount(null); // Set to null on error
        } finally {
            setIsLoadingUserCount(false);
        }
      }
      fetchUserCount();
    }, [firestore]);

    const isLoading = isLoadingTenants || isLoadingUserCount;

    const renderStat = (value: number | null) => {
        if (isLoading) return <Loader2 className="h-6 w-6 animate-spin"/>;
        if (error || value === null) return <span className="text-destructive text-sm">Error</span>;
        return <div className="text-2xl font-bold">{value}</div>;
    }

    return (
        <div className="flex flex-col gap-6">
        <div>
            <h1 className="text-3xl font-bold font-headline">SuperAdmin Dashboard</h1>
            <p className="text-muted-foreground">Platform-wide ecosystem overview.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
            <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Active Organizations</CardTitle>
                <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                {renderStat(tenants?.length || 0)}
                <p className="text-xs text-muted-foreground">
                Currently subscribed tenants
                </p>
            </CardContent>
            </Card>
            <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Active Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                {renderStat(userCount)}
                <p className="text-xs text-muted-foreground">
                Across all organizations
                </p>
            </CardContent>
            </Card>
            <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Platform-wide Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">$95,430.50</div>
                <p className="text-xs text-muted-foreground">
                    This month's total revenue
                </p>
            </CardContent>
            </Card>
        </div>
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">System Health</CardTitle>
                <CardDescription>View system-wide audit logs and health status.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-center h-48 border-2 border-dashed rounded-lg">
                <p className="text-muted-foreground text-center">System health monitoring component coming soon...</p>
                </div>
            </CardContent>
            </Card>
        </div>
    );
}
