import { useMemo, useState } from "react";
import Papa from "papaparse";
import { AlertTriangle, CheckCircle2, Download, FileSpreadsheet, Loader2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatNaira } from "@/lib/constants";
import { getErrorMessage } from "@/lib/utils";
import { getCategoryLabel } from "@/lib/productCategories";
import { copyImagesToStorage } from "@/lib/productImages";
import { IMPORT_COLUMNS, ParsedRow, TEMPLATE_ROWS, mapHeader, parseRow } from "@/lib/productImport";
import { Product } from "@/types/database";

interface ProductImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existingProducts: Product[];
  onImported: () => void;
}

interface ImportResult {
  created: number;
  updated: number;
  failed: { rowNumber: number; name: string; error: string }[];
  imageWarnings: number;
}

const downloadTemplate = () => {
  const csv = Papa.unparse({
    fields: [...IMPORT_COLUMNS],
    data: TEMPLATE_ROWS.map((row) => IMPORT_COLUMNS.map((column) => row[column] ?? "")),
  });
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "luminate-products-template.csv";
  link.click();
  URL.revokeObjectURL(url);
};

const ProductImportDialog = ({ open, onOpenChange, existingProducts, onImported }: ProductImportDialogProps) => {
  const [fileName, setFileName] = useState("");
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [copyImages, setCopyImages] = useState(true);
  const [isImporting, setIsImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<ImportResult | null>(null);

  const validRows = rows.filter((row) => row.product);
  const invalidRows = rows.filter((row) => !row.product);

  const existingByName = useMemo(
    () => new Map(existingProducts.map((product) => [product.name.trim().toLowerCase(), product.id])),
    [existingProducts]
  );

  const reset = () => {
    setFileName("");
    setRows([]);
    setProgress(0);
    setResult(null);
  };

  const handleOpenChange = (next: boolean) => {
    if (isImporting) return;
    if (!next) reset();
    onOpenChange(next);
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!/\.(csv|txt)$/i.test(file.name)) {
      toast.error("Please upload a CSV file. In Excel or Google Sheets, use File → Download / Save as → CSV.");
      return;
    }

    setResult(null);
    setFileName(file.name);
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: "greedy",
      transformHeader: mapHeader,
      complete: (parsed) => {
        if (!parsed.meta.fields?.includes("name")) {
          toast.error('Couldn\'t find a "name" column. Start from the template.');
          setRows([]);
          return;
        }
        // Row 1 is the header, so data starts at spreadsheet row 2
        setRows(parsed.data.map((row, index) => parseRow(row, index + 2)));
      },
      error: (error) => toast.error(`Couldn't read the file: ${error.message}`),
    });
  };

  const runImport = async () => {
    setIsImporting(true);
    setProgress(0);
    const outcome: ImportResult = { created: 0, updated: 0, failed: [], imageWarnings: 0 };
    // Also tracks products created earlier in this run, so repeated names update instead of duplicating
    const knownIds = new Map(existingByName);

    for (let i = 0; i < validRows.length; i++) {
      const row = validRows[i];
      const product = { ...row.product! };

      try {
        if (copyImages) {
          const images = [product.image_url, ...product.image_urls].filter(Boolean) as string[];
          if (images.length) {
            const { urls, failed } = await copyImagesToStorage(images);
            outcome.imageWarnings += failed.length;
            const [main, ...gallery] = product.image_url ? urls : [null, ...urls];
            product.image_url = main;
            product.image_urls = gallery;
          }
        }

        const productData = {
          ...product,
          // Legacy column from the removed coin system; still NOT NULL in the schema
          price_coins: Math.round(product.price_naira / 100),
        };

        const nameKey = product.name.trim().toLowerCase();
        const existingId = knownIds.get(nameKey);
        let productId = existingId;

        if (existingId) {
          const { error } = await supabase.from("products").update(productData).eq("id", existingId);
          if (error) throw error;
          outcome.updated++;
        } else {
          const { data, error } = await supabase.from("products").insert(productData).select("id").single();
          if (error) throw error;
          productId = data.id;
          knownIds.set(nameKey, data.id);
          outcome.created++;
        }

        if (row.sourcing) {
          const { error } = await supabase
            .from("product_sourcing")
            .upsert({ product_id: productId!, ...row.sourcing });
          if (error) throw error;
        }
      } catch (error) {
        outcome.failed.push({ rowNumber: row.rowNumber, name: product.name, error: getErrorMessage(error) });
      }

      setProgress(Math.round(((i + 1) / validRows.length) * 100));
    }

    setResult(outcome);
    setIsImporting(false);
    onImported();

    if (outcome.failed.length === 0) {
      toast.success(`Imported ${outcome.created + outcome.updated} products`);
    } else {
      toast.error(`${outcome.failed.length} row(s) failed to import`);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-5xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import products from a spreadsheet</DialogTitle>
          <DialogDescription>
            One row per product. Products whose name already exists are updated instead of duplicated.
          </DialogDescription>
        </DialogHeader>

        {!result && (
          <div className="space-y-6">
            {/* Steps */}
            <ol className="grid gap-3 text-sm sm:grid-cols-3">
              <li className="rounded-xl border p-4">
                <p className="font-medium">1. Get the template</p>
                <p className="mt-1 text-muted-foreground">Open it in Excel or Google Sheets. Two example rows show the format.</p>
                <Button type="button" variant="outline" size="sm" className="mt-3" onClick={downloadTemplate}>
                  <Download /> Download template
                </Button>
              </li>
              <li className="rounded-xl border p-4">
                <p className="font-medium">2. Fill in your products</p>
                <p className="mt-1 text-muted-foreground">
                  Required: <b>name</b>, <b>price_naira</b>, <b>tier</b>. Separate lists with <b>|</b>, write specs as{" "}
                  <b>Power: 60W | CRI: 95</b>.
                </p>
              </li>
              <li className="rounded-xl border p-4">
                <p className="font-medium">3. Save as CSV and upload</p>
                <p className="mt-1 text-muted-foreground">File → Download (Sheets) or Save As (Excel) → CSV.</p>
                <label className="mt-3 inline-flex h-9 cursor-pointer items-center gap-2 rounded-full bg-primary px-3.5 text-sm font-medium text-primary-foreground hover:bg-primary/85">
                  <FileSpreadsheet className="h-4 w-4" /> Choose CSV file
                  <input type="file" accept=".csv,text/csv" className="sr-only" onChange={handleFile} />
                </label>
              </li>
            </ol>

            {rows.length > 0 && (
              <>
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
                  <span className="font-medium">{fileName}</span>
                  <span className="flex items-center gap-1.5 text-success">
                    <CheckCircle2 className="h-4 w-4" /> {validRows.length} ready
                  </span>
                  {invalidRows.length > 0 && (
                    <span className="flex items-center gap-1.5 text-destructive">
                      <XCircle className="h-4 w-4" /> {invalidRows.length} with errors (will be skipped)
                    </span>
                  )}
                </div>

                <div className="max-h-[22rem] overflow-auto rounded-xl border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-14">Row</TableHead>
                        <TableHead>Product</TableHead>
                        <TableHead>Tier</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                        <TableHead>Photos</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rows.map((row) => {
                        const product = row.product;
                        const photoCount = product ? [product.image_url, ...product.image_urls].filter(Boolean).length : 0;
                        const isUpdate = product && existingByName.has(product.name.trim().toLowerCase());
                        return (
                          <TableRow key={row.rowNumber} className={!product ? "bg-destructive/5" : undefined}>
                            <TableCell className="text-muted-foreground">{row.rowNumber}</TableCell>
                            <TableCell className="max-w-[16rem]">
                              <p className="truncate font-medium">{product?.name || "—"}</p>
                              {isUpdate && <p className="text-xs text-muted-foreground">Updates existing product</p>}
                            </TableCell>
                            <TableCell className="capitalize">{product?.tier || "—"}</TableCell>
                            <TableCell>{product ? getCategoryLabel(product.category) || "Automatic" : "—"}</TableCell>
                            <TableCell className="text-right">{product ? formatNaira(product.price_naira) : "—"}</TableCell>
                            <TableCell>{product ? photoCount : "—"}</TableCell>
                            <TableCell className="min-w-[14rem] text-xs">
                              {row.errors.map((error) => (
                                <p key={error} className="flex items-start gap-1 text-destructive">
                                  <XCircle className="mt-0.5 h-3 w-3 shrink-0" /> {error}
                                </p>
                              ))}
                              {row.warnings.map((warning) => (
                                <p key={warning} className="flex items-start gap-1 text-muted-foreground">
                                  <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0 text-warning" /> {warning}
                                </p>
                              ))}
                              {product && row.errors.length === 0 && row.warnings.length === 0 && (
                                <span className="text-success">Ready</span>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>

                <label className="flex items-center justify-between gap-4 rounded-xl border p-4">
                  <span>
                    <span className="block text-sm font-medium">Copy photos to my storage (recommended)</span>
                    <span className="text-xs text-muted-foreground">
                      Saves supplier photos on your site so they don't break if the supplier changes their listing. Slower for big files.
                    </span>
                  </span>
                  <Switch checked={copyImages} onCheckedChange={setCopyImages} disabled={isImporting} />
                </label>

                {isImporting && (
                  <div className="space-y-2">
                    <Progress value={progress} />
                    <p className="text-xs text-muted-foreground">Importing… {progress}%. Keep this window open.</p>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {result && (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border p-4">
                <p className="text-3xl font-semibold">{result.created}</p>
                <p className="text-sm text-muted-foreground">new products</p>
              </div>
              <div className="rounded-xl border p-4">
                <p className="text-3xl font-semibold">{result.updated}</p>
                <p className="text-sm text-muted-foreground">existing products updated</p>
              </div>
              <div className="rounded-xl border p-4">
                <p className="text-3xl font-semibold">{result.failed.length + invalidRows.length}</p>
                <p className="text-sm text-muted-foreground">rows skipped or failed</p>
              </div>
            </div>
            {result.imageWarnings > 0 && (
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <AlertTriangle className="h-4 w-4 text-warning" />
                {result.imageWarnings} photo(s) couldn't be copied and stay linked to the supplier. Check them in the product editor.
              </p>
            )}
            {result.failed.map((failure) => (
              <p key={failure.rowNumber} className="text-sm text-destructive">
                Row {failure.rowNumber} ({failure.name}): {failure.error}
              </p>
            ))}
          </div>
        )}

        <DialogFooter>
          {result ? (
            <>
              <Button variant="outline" onClick={reset}>
                Import another file
              </Button>
              <Button onClick={() => handleOpenChange(false)}>Done</Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={isImporting}>
                Cancel
              </Button>
              <Button onClick={runImport} disabled={validRows.length === 0 || isImporting}>
                {isImporting && <Loader2 className="animate-spin" />}
                Import {validRows.length > 0 ? `${validRows.length} product${validRows.length > 1 ? "s" : ""}` : ""}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProductImportDialog;
