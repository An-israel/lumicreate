import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Product, ProductTier, ContentType } from "@/types/database";

interface UseProductsOptions {
  tier?: ProductTier;
  contentType?: ContentType;
  isPackage?: boolean;
}

export function useProducts(options: UseProductsOptions = {}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchProducts = async () => {
    setIsLoading(true);
    setError(null);

    let query = supabase.from("products").select("*");

    if (options.tier) {
      query = query.eq("tier", options.tier);
    }

    if (options.isPackage !== undefined) {
      query = query.eq("is_package", options.isPackage);
    }

    if (options.contentType) {
      query = query.contains("content_types", [options.contentType]);
    }

    query = query.eq("in_stock", true).order("price_naira", { ascending: true });

    const { data, error: queryError } = await query;

    if (queryError) {
      setError(queryError);
    } else {
      setProducts(data as Product[]);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, [options.tier, options.contentType, options.isPackage]);

  return { products, isLoading, error, refetch: fetchProducts };
}

export function useProduct(productId: string | undefined) {
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!productId) {
      setIsLoading(false);
      return;
    }

    const fetchProduct = async () => {
      setIsLoading(true);
      const { data, error: queryError } = await supabase
        .from("products")
        .select("*")
        .eq("id", productId)
        .single();

      if (queryError) {
        setError(queryError);
      } else {
        setProduct(data as Product);
      }
      setIsLoading(false);
    };

    fetchProduct();
  }, [productId]);

  return { product, isLoading, error };
}