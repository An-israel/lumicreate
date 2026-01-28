import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface PageContent {
  id: string;
  page_key: string;
  section_key: string;
  content: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export function usePageContent(pageKey: string, sectionKey: string) {
  const [content, setContent] = useState<Record<string, any> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      setIsLoading(true);
      const { data } = await supabase
        .from("page_content")
        .select("content")
        .eq("page_key", pageKey)
        .eq("section_key", sectionKey)
        .maybeSingle();

      if (data) {
        setContent(data.content as Record<string, any>);
      }
      setIsLoading(false);
    };

    fetchContent();
  }, [pageKey, sectionKey]);

  return { content, isLoading };
}

export function useSectionVisibility(pageKey: string) {
  const [visibility, setVisibility] = useState<Record<string, boolean> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchVisibility = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("page_content")
        .select("content")
        .eq("page_key", pageKey)
        .eq("section_key", "_visibility")
        .maybeSingle();

      if (error) {
        console.error("Error fetching visibility:", error);
      }
      
      if (data && data.content) {
        setVisibility(data.content as Record<string, boolean>);
      } else {
        // No visibility settings found, all sections visible by default
        setVisibility({});
      }
      setIsLoading(false);
    };

    fetchVisibility();
  }, [pageKey]);

  const isSectionVisible = (sectionKey: string): boolean => {
    // While loading or if no visibility data, show all sections
    if (visibility === null) return true;
    // If section key exists in visibility, use its value; otherwise default to true
    if (sectionKey in visibility) {
      return visibility[sectionKey] === true;
    }
    return true;
  };

  return { visibility: visibility || {}, isSectionVisible, isLoading };
}

export function useAllPageContent() {
  const [pages, setPages] = useState<PageContent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchContent = async () => {
    setIsLoading(true);
    const { data } = await supabase
      .from("page_content")
      .select("*")
      .order("page_key", { ascending: true });

    if (data) {
      setPages(data as PageContent[]);
    }
    setIsLoading(false);
  };

  const upsertContent = async (
    pageKey: string,
    sectionKey: string,
    content: Record<string, any>
  ) => {
    const { error } = await supabase
      .from("page_content")
      .upsert(
        { page_key: pageKey, section_key: sectionKey, content },
        { onConflict: "page_key,section_key" }
      );

    if (!error) {
      await fetchContent();
      return true;
    }
    return false;
  };

  const deleteContent = async (id: string) => {
    const { error } = await supabase
      .from("page_content")
      .delete()
      .eq("id", id);

    if (!error) {
      await fetchContent();
      return true;
    }
    return false;
  };

  useEffect(() => {
    fetchContent();
  }, []);

  return { pages, isLoading, upsertContent, deleteContent, refetch: fetchContent };
}

// Legacy PAGE_SECTIONS for backward compatibility - use CMS_PAGES from cmsConfig.ts instead
export const PAGE_SECTIONS = {
  home: {
    label: "Homepage",
    sections: {
      hero: {
        label: "Hero Section",
        fields: [
          { key: "title", label: "Title", type: "text" },
          { key: "subtitle", label: "Subtitle", type: "text" },
          { key: "cta_text", label: "CTA Button Text", type: "text" },
          { key: "cta_link", label: "CTA Button Link", type: "text" },
        ],
      },
      how_it_works: {
        label: "How It Works",
        fields: [
          { key: "title", label: "Section Title", type: "text" },
          { key: "subtitle", label: "Section Subtitle", type: "textarea" },
        ],
      },
    },
  },
  about: {
    label: "About Page",
    sections: {
      hero: {
        label: "Hero Section",
        fields: [
          { key: "title", label: "Title", type: "text" },
          { key: "description", label: "Description", type: "textarea" },
        ],
      },
      mission: {
        label: "Mission Section",
        fields: [
          { key: "title", label: "Title", type: "text" },
          { key: "content", label: "Content", type: "textarea" },
        ],
      },
    },
  },
  faq: {
    label: "FAQ Page",
    sections: {
      hero: {
        label: "Hero Section",
        fields: [
          { key: "title", label: "Title", type: "text" },
          { key: "subtitle", label: "Subtitle", type: "text" },
        ],
      },
    },
  },
  resources: {
    label: "Resources Page",
    sections: {
      hero: {
        label: "Hero Section",
        fields: [
          { key: "title", label: "Title", type: "text" },
          { key: "subtitle", label: "Subtitle", type: "text" },
        ],
      },
    },
  },
};
