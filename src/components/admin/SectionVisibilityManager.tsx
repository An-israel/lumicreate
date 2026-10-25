import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Eye, EyeOff, Save, RefreshCw } from "lucide-react";
import { CMS_PAGES } from "@/lib/cmsConfig";

interface SectionVisibility {
  [key: string]: boolean;
}

interface PageVisibility {
  [pageKey: string]: SectionVisibility;
}

export default function SectionVisibilityManager() {
  const [visibility, setVisibility] = useState<PageVisibility>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchVisibility();
  }, []);

  const fetchVisibility = async () => {
    setIsLoading(true);
    const { data } = await supabase
      .from("page_content")
      .select("*")
      .eq("section_key", "_visibility");

    // Initialize with all sections visible by default
    const defaultVisibility: PageVisibility = {};
    Object.entries(CMS_PAGES).forEach(([pageKey, page]) => {
      defaultVisibility[pageKey] = {};
      Object.entries(page.sections).forEach(([sectionKey, section]) => {
        if (section.removable) {
          defaultVisibility[pageKey][sectionKey] = true;
        }
      });
    });

    // Override with saved visibility settings
    if (data) {
      data.forEach((row) => {
        const content = row.content as Record<string, boolean>;
        if (defaultVisibility[row.page_key]) {
          defaultVisibility[row.page_key] = {
            ...defaultVisibility[row.page_key],
            ...content,
          };
        }
      });
    }

    setVisibility(defaultVisibility);
    setIsLoading(false);
  };

  const handleToggle = (pageKey: string, sectionKey: string) => {
    setVisibility((prev) => ({
      ...prev,
      [pageKey]: {
        ...prev[pageKey],
        [sectionKey]: !prev[pageKey]?.[sectionKey],
      },
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);

    try {
      // Save visibility for each page
      for (const [pageKey, sections] of Object.entries(visibility)) {
        const { error } = await supabase.from("page_content").upsert(
          {
            page_key: pageKey,
            section_key: "_visibility",
            content: sections,
          },
          { onConflict: "page_key,section_key" }
        );

        if (error) {
          console.error("Error saving visibility:", error);
          toast.error(`Failed to save: ${error.message}`);
          setIsSaving(false);
          return;
        }
      }

      toast.success("Section visibility saved");
    } catch (error) {
      console.error("Unexpected error:", error);
      toast.error("Failed to save visibility settings");
    }

    setIsSaving(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Section Visibility</h2>
          <p className="text-muted-foreground">
            Toggle sections on or off for each page
          </p>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <div className="grid gap-6">
        {Object.entries(CMS_PAGES).map(([pageKey, page]) => {
          const removableSections = Object.entries(page.sections).filter(
            ([, section]) => section.removable
          );

          if (removableSections.length === 0) return null;

          return (
            <Card key={pageKey}>
              <CardHeader>
                <CardTitle className="text-lg">{page.label}</CardTitle>
                <CardDescription>
                  Control which sections appear on this page
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {removableSections.map(([sectionKey, section]) => {
                    const isVisible = visibility[pageKey]?.[sectionKey] ?? true;

                    return (
                      <div
                        key={sectionKey}
                        className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/50"
                      >
                        <div className="flex items-center gap-3">
                          {isVisible ? (
                            <Eye className="h-4 w-4 text-primary" />
                          ) : (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          )}
                          <div>
                            <Label className="font-medium">{section.label}</Label>
                            {section.description && (
                              <p className="text-xs text-muted-foreground">
                                {section.description}
                              </p>
                            )}
                          </div>
                        </div>
                        <Switch
                          checked={isVisible}
                          onCheckedChange={() => handleToggle(pageKey, sectionKey)}
                        />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
