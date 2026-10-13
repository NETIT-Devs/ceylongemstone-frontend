import { useEffect, useState } from "react";

export const HOME_HERO_SLIDES_STORAGE_KEY = "ceylon-home-hero-slides";
export const BLOG_POSTS_STORAGE_KEY = "ceylon-blog-posts";

const readItems = (key) => {
  try {
    const items = JSON.parse(window.localStorage.getItem(key) || "[]");
    return Array.isArray(items) ? items : [];
  } catch {
    return [];
  }
};

const useStoredItems = (key) => {
  const [items, setItems] = useState(() => readItems(key));

  useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(items));
  }, [items, key]);

  useEffect(() => {
    const syncItems = (event) => {
      if (event.key === key) setItems(readItems(key));
    };
    window.addEventListener("storage", syncItems);
    return () => window.removeEventListener("storage", syncItems);
  }, [key]);

  return [items, setItems];
};

export const useHomeHeroSlides = () =>
  useStoredItems(HOME_HERO_SLIDES_STORAGE_KEY);

export const useManagedBlogPosts = () =>
  useStoredItems(BLOG_POSTS_STORAGE_KEY);
