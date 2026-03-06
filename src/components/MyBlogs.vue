<template>
  <section id="blogs" class="w3-content w3-margin-top" style="max-width: 1400px">
    <div class="blogs-shell">
      <header class="blogs-header">
        <h1>Blogs</h1>
        
      </header>

      <article
        v-for="post in sortedBlogPosts"
        :key="post.id"
        class="blog-card"
      >
        <div class="blog-meta">
          <span class="blog-date">{{ formatDate(post.dateIso) }}</span>
          <span v-if="post.category" class="blog-category">{{ post.category }}</span>
        </div>
        <h2 class="blog-title">
          <a
            :href="resolvePostUrl(post.url)"
            target="_blank"
            rel="noopener noreferrer"
          >
            {{ post.title }}
          </a>
        </h2>
        <p class="blog-summary">{{ post.summary }}</p>
        <a
          class="blog-link"
          :href="resolvePostUrl(post.url)"
          target="_blank"
          rel="noopener noreferrer"
        >
          {{ post.linkLabel }}
        </a>
      </article>

      <article v-if="sortedBlogPosts.length === 0" class="blog-card empty-state">
        <h2>No Blog Posts Yet</h2>
        <p>
          Check back later for new posts.
        </p>
      </article>
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import {
  blogPosts,
  getBlogPostsSortedNewestFirst,
  type BlogPost,
} from "../data/blogPostsData";
import { resolvePublicAssetPath } from "../utils/publicAssetPath";

const DATE_FORMATTER = new Intl.DateTimeFormat("en-GB", {
  year: "numeric",
  month: "short",
  day: "2-digit",
});

export default defineComponent({
  name: "MyBlogs",
  computed: {
    sortedBlogPosts(): BlogPost[] {
      return getBlogPostsSortedNewestFirst(blogPosts);
    },
  },
  methods: {
    formatDate(dateIso: string): string {
      const parsed = new Date(`${dateIso}T00:00:00Z`);
      if (Number.isNaN(parsed.getTime())) {
        return dateIso;
      }
      return DATE_FORMATTER.format(parsed);
    },
    resolvePostUrl(url: string): string {
      return url.startsWith("/") ? resolvePublicAssetPath(url) : url;
    },
  },
});
</script>

<style scoped>
#blogs {
  padding: 0 16px 140px;
}

.blogs-shell {
  display: grid;
  gap: 18px;
}

.blogs-header,
.blog-card {
  background: var(--surface-bg);
  outline: 2px solid var(--surface-outline);
  border-radius: 14px;
  padding: 16px 20px;
}

.blogs-header h1 {
  margin: 0;
  color: var(--page-text);
  font-family: var(--content-heading-font);
  font-size: var(--content-h1-size);
  font-weight: 600;
}

.blogs-header p {
  margin: 8px 0 0;
  opacity: 0.9;
}

.blog-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.blog-date,
.blog-category {
  border: 1px solid var(--surface-outline);
  border-radius: 999px;
  padding: 2px 10px;
  font-size: var(--font-size-meta);
}

.blog-title {
  margin: 10px 0 0;
  font-family: var(--content-heading-font);
  font-size: var(--content-h2-size);
}

.blog-summary {
  margin: 10px 0 0;
  line-height: 1.5;
}

.blog-link {
  display: inline-block;
  margin-top: 10px;
  font-weight: 700;
}

.empty-state h2 {
  margin-top: 0;
}

.empty-state p {
  margin: 8px 0 0;
}

@media (max-width: 768px) {
  #blogs {
    padding: 0 10px 132px;
  }

  .blogs-header,
  .blog-card {
    padding: 14px;
  }
}
</style>
