import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function FinancialsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Financials</CardTitle>
        <CardDescription>Generate invoices, log payments, and manage balances.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center h-96 border-2 border-dashed rounded-lg">
          <p className="text-muted-foreground">Financials component coming soon...</p>
        </div>
      </CardContent>
    </Card>
  );
}
