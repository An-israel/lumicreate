import { useState, useEffect } from "react";
import { useAllPageContent, PAGE_SECTIONS, PageContent } from "@/hooks/usePageContent";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { toast } from "sonner";
import { Save, Plus, Trash2 } from "lucide-react";

export default function PageContentEditor() {
  const { pages, isLoading, upsertContent, deleteContent, refetch } = useAllPageContent();
  const [selectedPage, setSelectedPage] = useState<string>("home");
  const [formData, setFormData] = useState<Record<string, Record<string, string>>>({});
  const [isSaving, setIsSaving] = useState<string | null>(null);

  // Initialize form data from existing content
  useEffect(() => {
    const pageContent: Record<string, Record<string, string>> = {};
    
    pages.forEach((page) => {
      const key = `${page.page_key}_${page.section_key}`;
      pageContent[key] = page.content as Record<string, string>;
    });

    setFormData(pageContent);
  }, [pages]);

  const handleFieldChange = (
    pageKey: string,
    sectionKey: string,
    fieldKey: string,
    value: string
  ) => {
    const key = `${pageKey}_${sectionKey}`;
    setFormData((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        [fieldKey]: value,
      },
    }));
  };

  const handleSaveSection = async (pageKey: string, sectionKey: string) => {
    const key = `${pageKey}_${sectionKey}`;
    const content = formData[key] || {};

    setIsSaving(key);
    const success = await upsertContent(pageKey, sectionKey, content);
    setIsSaving(null);

    if (success) {
      toast.success("Content saved successfully");
    } else {
      toast.error("Failed to save content");
    }
  };

  const handleDeleteSection = async (id: string) => {
    if (!confirm("Are you sure you want to delete this content?")) return;

    const success = await deleteContent(id);
    if (success) {
      toast.success("Content deleted");
    } else {
      toast.error("Failed to delete content");
    }
  };

  const getExistingContent = (pageKey: string, sectionKey: string) => {
    return pages.find(
      (p) => p.page_key === pageKey && p.section_key === sectionKey
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const currentPageConfig = PAGE_SECTIONS[selectedPage as keyof typeof PAGE_SECTIONS];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-2xl font-bold">Page Content Editor</h2>
      </div>

      <div className="flex items-center gap-4">
        <Label>Select Page:</Label>
        <Select value={selectedPage} onValueChange={setSelectedPage}>
          <SelectTrigger className="w-64">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(PAGE_SECTIONS).map(([key, config]) => (
              <SelectItem key={key} value={key}>
                {config.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {currentPageConfig && (
        <Accordion type="multiple" className="space-y-4">
          {Object.entries(currentPageConfig.sections).map(([sectionKey, section]) => {
            const formKey = `${selectedPage}_${sectionKey}`;
            const existingContent = getExistingContent(selectedPage, sectionKey);
            const sectionData = formData[formKey] || {};

            return (
              <AccordionItem
                key={sectionKey}
                value={sectionKey}
                className="border rounded-lg px-4"
              >
                <AccordionTrigger className="text-lg font-medium">
                  {section.label}
                  {existingContent && (
                    <span className="ml-2 text-xs text-muted-foreground">(configured)</span>
                  )}
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pb-4">
                  {section.fields.map((field) => (
                    <div key={field.key} className="space-y-2">
                      <Label htmlFor={`${formKey}_${field.key}`}>{field.label}</Label>
                      {field.type === "textarea" ? (
                        <Textarea
                          id={`${formKey}_${field.key}`}
                          value={sectionData[field.key] || ""}
                          onChange={(e) =>
                            handleFieldChange(selectedPage, sectionKey, field.key, e.target.value)
                          }
                          rows={4}
                        />
                      ) : (
                        <Input
                          id={`${formKey}_${field.key}`}
                          value={sectionData[field.key] || ""}
                          onChange={(e) =>
                            handleFieldChange(selectedPage, sectionKey, field.key, e.target.value)
                          }
                        />
                      )}
                    </div>
                  ))}

                  <div className="flex items-center gap-2 pt-2">
                    <Button
                      onClick={() => handleSaveSection(selectedPage, sectionKey)}
                      disabled={isSaving === formKey}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {isSaving === formKey ? "Saving..." : "Save Section"}
                    </Button>
                    {existingContent && (
                      <Button
                        variant="outline"
                        onClick={() => handleDeleteSection(existingContent.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Reset
                      </Button>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Current Content Overview</CardTitle>
        </CardHeader>
        <CardContent>
          {pages.length === 0 ? (
            <p className="text-muted-foreground">No custom content configured yet. Edit sections above to add content.</p>
          ) : (
            <div className="space-y-2">
              {pages.map((page) => (
                <div
                  key={page.id}
                  className="flex items-center justify-between p-2 bg-muted rounded-md"
                >
                  <span>
                    <span className="font-medium capitalize">{page.page_key}</span>
                    {" → "}
                    <span className="text-muted-foreground">{page.section_key}</span>
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteSection(page.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
