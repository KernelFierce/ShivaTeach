import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, FileText, Banknote } from "lucide-react";

export default function FinancialsPage() {
  return (
    <div className="flex flex-col gap-6">
        <Card>
        <CardHeader>
            <div className="flex items-center justify-between">
                <div>
                    <CardTitle className="font-headline">Financials</CardTitle>
                    <CardDescription>Generate invoices, log payments, and manage student credit balances.</CardDescription>
                </div>
                <div className="flex gap-2">
                    <Button disabled>
                        <PlusCircle className="mr-2" />
                        New Invoice
                    </Button>
                    <Button variant="outline" disabled>
                        <Banknote className="mr-2" />
                        Log Payment
                    </Button>
                </div>
            </div>
        </CardHeader>
        </Card>
        <div className="grid gap-6 md:grid-cols-1">
             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <FileText className="h-5 w-5" />
                        All Invoices
                    </CardTitle>
                    <CardDescription>
                        A complete history of all generated invoices.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center h-96 border-2 border-dashed rounded-lg">
                    <p className="text-muted-foreground text-center p-4">Invoice table component coming soon...</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
