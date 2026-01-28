import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { CMSField } from "@/lib/cmsConfig";
import ImageUpload from "./ImageUpload";

interface ArrayFieldEditorProps {
  field: CMSField;
  value: any[];
  onChange: (value: any[]) => void;
}

export default function ArrayFieldEditor({
  field,
  value = [],
  onChange,
}: ArrayFieldEditorProps) {
  const addItem = () => {
    const newItem: Record<string, string> = {};
    field.arrayFields?.forEach((f) => {
      newItem[f.key] = "";
    });
    onChange([...value, newItem]);
  };

  const removeItem = (index: number) => {
    const newValue = [...value];
    newValue.splice(index, 1);
    onChange(newValue);
  };

  const updateItem = (index: number, key: string, newValue: string) => {
    const updated = [...value];
    updated[index] = { ...updated[index], [key]: newValue };
    onChange(updated);
  };

  if (!field.arrayFields) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">{field.label}</Label>
        <Button type="button" size="sm" variant="outline" onClick={addItem}>
          <Plus className="h-4 w-4 mr-1" />
          Add Item
        </Button>
      </div>

      {value.length === 0 ? (
        <p className="text-sm text-muted-foreground italic py-4 text-center border border-dashed rounded-lg">
          No items yet. Click "Add Item" to create one.
        </p>
      ) : (
        <div className="space-y-3">
          {value.map((item, index) => (
            <Card key={index} className="relative">
              <CardContent className="pt-4 pb-3">
                <div className="flex items-start gap-2">
                  <div className="pt-2 text-muted-foreground cursor-grab">
                    <GripVertical className="h-4 w-4" />
                  </div>
                  <div className="flex-1 space-y-3">
                    {field.arrayFields?.map((subField) => (
                      <div key={subField.key} className="space-y-1">
                        <Label className="text-xs text-muted-foreground">
                          {subField.label}
                        </Label>
                        {subField.type === "textarea" ? (
                          <Textarea
                            value={item[subField.key] || ""}
                            onChange={(e) =>
                              updateItem(index, subField.key, e.target.value)
                            }
                            rows={2}
                            className="text-sm"
                          />
                        ) : subField.type === "image" ? (
                          <ImageUpload
                            value={item[subField.key] || ""}
                            onChange={(url) =>
                              updateItem(index, subField.key, url)
                            }
                            label=""
                          />
                        ) : (
                          <Input
                            value={item[subField.key] || ""}
                            onChange={(e) =>
                              updateItem(index, subField.key, e.target.value)
                            }
                            className="text-sm"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="shrink-0 text-destructive hover:text-destructive"
                    onClick={() => removeItem(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
