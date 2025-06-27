import ProtectedLayout from "@/components/layout/protected-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileText, Calendar, Database } from "lucide-react";

export default function ExportPage() {
  return (
    <ProtectedLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Export Data</h1>
          <p className="text-muted-foreground">
            Download your journal entries and data in various formats
          </p>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Export Options
              </CardTitle>
              <CardDescription>
                Choose what data you'd like to export and in what format
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Journal Entries</CardTitle>
                    <CardDescription>
                      Export all your journal entries with metadata
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Format:
                      </span>
                      <span className="text-sm font-medium">
                        JSON, CSV, PDF
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Entries:
                      </span>
                      <span className="text-sm font-medium">0 entries</span>
                    </div>
                    <Button className="w-full" disabled>
                      <Download className="mr-2 h-4 w-4" />
                      Export Entries
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">AI Insights</CardTitle>
                    <CardDescription>
                      Export AI-generated insights and analysis
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Format:
                      </span>
                      <span className="text-sm font-medium">JSON, PDF</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Insights:
                      </span>
                      <span className="text-sm font-medium">0 insights</span>
                    </div>
                    <Button className="w-full" disabled>
                      <Download className="mr-2 h-4 w-4" />
                      Export Insights
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Complete Data Export
                  </CardTitle>
                  <CardDescription>
                    Export all your data including entries, insights, settings,
                    and metadata
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Format:
                    </span>
                    <span className="text-sm font-medium">ZIP Archive</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Size:</span>
                    <span className="text-sm font-medium">~0 KB</span>
                  </div>
                  <Button className="w-full" disabled>
                    <Database className="mr-2 h-4 w-4" />
                    Export All Data
                  </Button>
                </CardContent>
              </Card>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Export History
              </CardTitle>
              <CardDescription>
                View your previous export requests and downloads
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Download className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">No exports yet</h3>
                <p className="text-sm">Your export history will appear here</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Export Settings</CardTitle>
              <CardDescription>
                Configure your export preferences and data retention
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Include Metadata</p>
                  <p className="text-sm text-muted-foreground">
                    Include timestamps, tags, and mood data
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Configure
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Date Range</p>
                  <p className="text-sm text-muted-foreground">
                    Export entries from specific time periods
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Configure
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Auto-Export</p>
                  <p className="text-sm text-muted-foreground">
                    Schedule regular data exports
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Configure
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedLayout>
  );
}
