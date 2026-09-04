import PostEditor from "@/components/studio/PostEditor";
import StudioNav from "@/components/studio/StudioNav";

// `today` must be evaluated per request, not baked in at build time.
export const dynamic = "force-dynamic";

export default function NewPostPage() {
  const today = new Date().toISOString().slice(0, 10);

  return (
    <>
      <StudioNav />
      <h1 className="mt-8 text-3xl font-bold tracking-tight text-black">
        New post
      </h1>
      <PostEditor
        mode="create"
        initial={{
          slug: "",
          title: "",
          date: today,
          excerpt: "",
          author: "Aptenodyte Team",
          coverImage: null,
          draft: true,
          body: "",
        }}
      />
    </>
  );
}
