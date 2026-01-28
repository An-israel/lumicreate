import { useState, useEffect } from "react";
import { useAllPageContent, PageContent } from "@/hooks/usePageContent";
import { CMS_PAGES, CMSField } from "@/lib/cmsConfig";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Save, Trash2, RefreshCw, FileText, Layout, Globe } from "lucide-react";
import ImageUpload from "./ImageUpload";
import ArrayFieldEditor from "./ArrayFieldEditor";
import SectionVisibilityManager from "./SectionVisibilityManager";

export default function PageContentEditor() {
  const { pages, isLoading, upsertContent, deleteContent, refetch } = useAllPageContent();
  const [selectedPage, setSelectedPage] = useState<string>("home");
  const [formData, setFormData] = useState<Record<string, Record<string, any>>>({});
  const [isSaving, setIsSaving] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"content" | "visibility">("content");

  // Initialize form data from existing content
  useEffect(() => {
    const pageContent: Record<string, Record<string, any>> = {};

    pages.forEach((page) => {
      if (page.section_key === "_visibility") return; // Skip visibility settings
      const key = `${page.page_key}_${page.section_key}`;
      pageContent[key] = page.content as Record<string, any>;
    });

    setFormData(pageContent);
  }, [pages]);

  const handleFieldChange = (
    pageKey: string,
    sectionKey: string,
    fieldKey: string,
    value: any
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
    if (!confirm("Are you sure you want to reset this section to defaults?")) return;

    const success = await deleteContent(id);
    if (success) {
      toast.success("Section reset to defaults");
    } else {
      toast.error("Failed to reset section");
    }
  };

  const getExistingContent = (pageKey: string, sectionKey: string) => {
    return pages.find(
      (p) => p.page_key === pageKey && p.section_key === sectionKey
    );
  };

  const renderField = (
    field: CMSField,
    pageKey: string,
    sectionKey: string,
    formKey: string,
    sectionData: Record<string, any>
  ) => {
    const fieldId = `${formKey}_${field.key}`;

    switch (field.type) {
      case "textarea":
      case "richtext":
        return (
          <div key={field.key} className="space-y-2">
            <Label htmlFor={fieldId}>{field.label}</Label>
            <Textarea
              id={fieldId}
              value={sectionData[field.key] || ""}
              onChange={(e) =>
                handleFieldChange(pageKey, sectionKey, field.key, e.target.value)
              }
              placeholder={field.placeholder}
              rows={4}
            />
          </div>
        );

      case "image":
        return (
          <div key={field.key} className="space-y-2">
            <ImageUpload
              value={sectionData[field.key] || ""}
              onChange={(url) =>
                handleFieldChange(pageKey, sectionKey, field.key, url)
              }
              label={field.label}
            />
          </div>
        );

      case "array":
        return (
          <div key={field.key}>
            <ArrayFieldEditor
              field={field}
              value={sectionData[field.key] || []}
              onChange={(value) =>
                handleFieldChange(pageKey, sectionKey, field.key, value)
              }
            />
          </div>
        );

      default: // text, link
        return (
          <div key={field.key} className="space-y-2">
            <Label htmlFor={fieldId}>{field.label}</Label>
            <Input
              id={fieldId}
              value={sectionData[field.key] || ""}
              onChange={(e) =>
                handleFieldChange(pageKey, sectionKey, field.key, e.target.value)
              }
              placeholder={field.placeholder}
            />
          </div>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const currentPageConfig = CMS_PAGES[selectedPage];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Content Management</h2>
          <p className="text-muted-foreground">
            Edit all text, images, and content across your website
          </p>
        </div>
        <Button variant="outline" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="content" className="gap-2">
            <FileText className="h-4 w-4" />
            Edit Content
          </TabsTrigger>
          <TabsTrigger value="visibility" className="gap-2">
            <Layout className="h-4 w-4" />
            Section Visibility
          </TabsTrigger>
        </TabsList>

        <TabsContent value="visibility" className="mt-6">
          <SectionVisibilityManager />
        </TabsContent>

        <TabsContent value="content" className="mt-6">
          {/* Page Selector */}
          <div className="flex flex-wrap gap-2 mb-6">
            {Object.entries(CMS_PAGES).map(([key, config]) => (
              <Button
                key={key}
                variant={selectedPage === key ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedPage(key)}
                className="gap-2"
              >
                {key === "global" && <Globe className="h-4 w-4" />}
                {config.label}
              </Button>
            ))}
          </div>

          {/* Section Editor */}
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
                    className="border rounded-lg px-4 bg-card"
                  >
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-medium">{section.label}</span>
                        {existingContent && (
                          <Badge variant="secondary" className="text-xs">
                            Customized
                          </Badge>
                        )}
                        {section.removable && (
                          <Badge variant="outline" className="text-xs">
                            Toggleable
                          </Badge>
                        )}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4 pb-4">
                      {section.description && (
                        <p className="text-sm text-muted-foreground mb-4">
                          {section.description}
                        </p>
                      )}

                      {section.fields.map((field) =>
                        renderField(field, selectedPage, sectionKey, formKey, sectionData)
                      )}

                      <div className="flex items-center gap-2 pt-4 border-t">
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
                            Reset to Default
                          </Button>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          )}

          {/* Current Content Overview */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="text-lg">Configured Content</CardTitle>
              <CardDescription>
                Sections with custom content saved
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pages.filter((p) => p.section_key !== "_visibility").length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  No custom content configured yet. Edit sections above to customize your website.
                </p>
              ) : (
                <div className="space-y-2">
                  {pages
                    .filter((p) => p.section_key !== "_visibility")
                    .map((page) => (
                      <div
                        key={page.id}
                        className="flex items-center justify-between p-3 bg-muted rounded-lg"
                      >
                        <div>
                          <span className="font-medium capitalize">{page.page_key}</span>
                          <span className="text-muted-foreground"> → </span>
                          <span className="text-muted-foreground">{page.section_key}</span>
                        </div>
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
