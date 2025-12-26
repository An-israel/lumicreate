import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { CONTENT_TYPES, TIERS } from "@/lib/constants";

interface ProductFiltersProps {
  selectedTiers: string[];
  selectedContentTypes: string[];
  onTierChange: (tier: string) => void;
  onContentTypeChange: (type: string) => void;
  onClearFilters: () => void;
  showPackagesOnly: boolean;
  onPackagesOnlyChange: (value: boolean) => void;
}

const ProductFilters = ({
  selectedTiers,
  selectedContentTypes,
  onTierChange,
  onContentTypeChange,
  onClearFilters,
  showPackagesOnly,
  onPackagesOnlyChange,
}: ProductFiltersProps) => {
  const hasFilters = selectedTiers.length > 0 || selectedContentTypes.length > 0 || showPackagesOnly;

  return (
    <div className="space-y-6">
      {/* Active Filters */}
      {hasFilters && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">Active:</span>
          {selectedTiers.map((tier) => (
            <Badge
              key={tier}
              variant="secondary"
              className="cursor-pointer gap-1"
              onClick={() => onTierChange(tier)}
            >
              {tier}
              <X className="h-3 w-3" />
            </Badge>
          ))}
          {selectedContentTypes.map((type) => (
            <Badge
              key={type}
              variant="secondary"
              className="cursor-pointer gap-1"
              onClick={() => onContentTypeChange(type)}
            >
              {type.replace("_", " ")}
              <X className="h-3 w-3" />
            </Badge>
          ))}
          {showPackagesOnly && (
            <Badge
              variant="secondary"
              className="cursor-pointer gap-1"
              onClick={() => onPackagesOnlyChange(false)}
            >
              Packages
              <X className="h-3 w-3" />
            </Badge>
          )}
          <Button variant="ghost" size="sm" onClick={onClearFilters}>
            Clear all
          </Button>
        </div>
      )}

      {/* Filter Groups */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Tier Filter */}
        <div>
          <h3 className="font-semibold text-foreground mb-3">Tier</h3>
          <div className="space-y-2">
            {Object.entries(TIERS).map(([key, tier]) => (
              <div key={key} className="flex items-center space-x-2">
                <Checkbox
                  id={`tier-${key}`}
                  checked={selectedTiers.includes(key)}
                  onCheckedChange={() => onTierChange(key)}
                />
                <Label htmlFor={`tier-${key}`} className="text-sm cursor-pointer">
                  {tier.name}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Content Type Filter */}
        <div>
          <h3 className="font-semibold text-foreground mb-3">Content Type</h3>
          <div className="space-y-2">
            {CONTENT_TYPES.map((type) => (
              <div key={type.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`type-${type.id}`}
                  checked={selectedContentTypes.includes(type.id)}
                  onCheckedChange={() => onContentTypeChange(type.id)}
                />
                <Label htmlFor={`type-${type.id}`} className="text-sm cursor-pointer">
                  {type.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Other Filters */}
        <div>
          <h3 className="font-semibold text-foreground mb-3">Options</h3>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="packages-only"
                checked={showPackagesOnly}
                onCheckedChange={(checked) => onPackagesOnlyChange(checked as boolean)}
              />
              <Label htmlFor="packages-only" className="text-sm cursor-pointer">
                Show Packages Only
              </Label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductFilters;
