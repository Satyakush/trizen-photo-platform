import { useEffect, useState } from "react";
import {
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  getPublicGalleryPhotos,
} from "../../services/publicGallery.service";

function PublicGallery() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [photos, setPhotos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedPhoto, setSelectedPhoto] =
    useState(null);

  useEffect(() => {
    loadGallery();
  }, [slug]);

  const loadGallery = async () => {
    try {
      setIsLoading(true);
      setError("");

      /*
       * First use the token passed directly from
       * GalleryAccess.
       *
       * If the page was refreshed or opened directly,
       * fall back to sessionStorage.
       */
      const token =
        location.state?.galleryToken ||
        sessionStorage.getItem(
          `gallery_token_${slug}`
        );

      if (!token) {
        navigate(`/gallery/${slug}`, {
          replace: true,
        });
        return;
      }

      /*
       * Make sure the token is persisted even when
       * arriving through navigation state.
       */
      sessionStorage.setItem(
        `gallery_token_${slug}`,
        token
      );

      const response =
        await getPublicGalleryPhotos(
          slug,
          token
        );

      const galleryPhotos =
        response.data ||
        response.photos ||
        [];

      setPhotos(galleryPhotos);
    } catch (err) {
      console.error(
        "Failed to load gallery:",
        err
      );

      if (
        err.response?.status === 401 ||
        err.response?.status === 403
      ) {
        sessionStorage.removeItem(
          `gallery_token_${slug}`
        );

        setError(
          "Your gallery access has expired. Please enter the PIN again."
        );

        return;
      }

      setError(
        err.response?.data?.message ||
          "Unable to load this gallery."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleExitGallery = () => {
    sessionStorage.removeItem(
      `gallery_token_${slug}`
    );

    navigate(`/gallery/${slug}`, {
      replace: true,
    });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">

        <div className="text-center">

          <div className="mx-auto mb-5 h-10 w-10 animate-spin rounded-full border-4 border-white/10 border-t-white" />

          <p className="text-sm font-medium text-slate-400">
            Loading your gallery...
          </p>

        </div>

      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-5">

        <div className="w-full max-w-md text-center">

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 text-2xl">
            ⚠
          </div>

          <h1 className="mt-6 text-2xl font-bold text-white">
            Gallery access required
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-400">
            {error}
          </p>

          <button
            onClick={() =>
              navigate(`/gallery/${slug}`, {
                replace: true,
              })
            }
            className="mt-6 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
          >
            Enter PIN Again
          </button>

        </div>

      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/90 backdrop-blur-xl">

        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-8">

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-lg text-slate-900">
              ✦
            </div>

            <div>

              <p className="text-sm font-bold tracking-wide">
                Private Gallery
              </p>

              <p className="text-xs text-slate-500">
                {photos.length}{" "}
                {photos.length === 1
                  ? "photo"
                  : "photos"}
              </p>

            </div>

          </div>

          <button
            onClick={handleExitGallery}
            className="rounded-xl border border-white/10 px-4 py-2 text-xs font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white"
          >
            Exit Gallery
          </button>

        </div>

      </header>

      <section className="mx-auto max-w-7xl px-5 pb-10 pt-12 md:px-8 md:pb-14 md:pt-16">

        <div className="max-w-3xl">

          <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-500">
            Your Collection
          </p>

          <h1 className="mt-4 text-4xl font-bold tracking-tight md:text-6xl">
            Memories,
            <br />
            beautifully captured.
          </h1>

          <p className="mt-5 max-w-xl text-sm leading-7 text-slate-400 md:text-base">
            Browse the photographs selected for you.
            Click any photo to view it in full size.
          </p>

        </div>

      </section>

      {photos.length === 0 ? (
        <main className="mx-auto max-w-7xl px-5 pb-20 md:px-8">

          <div className="rounded-3xl border border-dashed border-white/10 px-6 py-20 text-center">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 text-2xl">
              📷
            </div>

            <h2 className="mt-5 text-xl font-bold">
              No photos yet
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              There are currently no photos available
              in this gallery.
            </p>

          </div>

        </main>
      ) : (
        <main className="mx-auto max-w-7xl px-5 pb-20 md:px-8">

          <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 xl:columns-4">

            {photos.map((photo) => (
              <button
                key={photo._id}
                type="button"
                onClick={() =>
                  setSelectedPhoto(photo)
                }
                className="group relative mb-4 block w-full overflow-hidden rounded-2xl bg-slate-900 text-left"
              >

                <img
                  src={photo.storageUrl}
                  alt={
                    photo.filename ||
                    "Gallery photo"
                  }
                  loading="lazy"
                  className="h-auto w-full object-cover transition duration-500 group-hover:scale-[1.03] group-hover:opacity-90"
                />

                <div className="pointer-events-none absolute inset-0 flex items-end bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition duration-300 group-hover:opacity-100">

                  <div className="flex w-full items-center justify-between p-4">

                    <span className="max-w-[75%] truncate text-xs font-medium text-white">
                      {photo.filename ||
                        "Photo"}
                    </span>

                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-sm backdrop-blur-md">
                      ↗
                    </span>

                  </div>

                </div>

              </button>
            ))}

          </div>

        </main>
      )}

      {selectedPhoto && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4 backdrop-blur-sm md:p-8"
          onClick={() =>
            setSelectedPhoto(null)
          }
        >

          <button
            type="button"
            onClick={() =>
              setSelectedPhoto(null)
            }
            className="absolute right-5 top-5 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-xl text-white transition hover:bg-white/20"
          >
            ×
          </button>

          <div
            className="relative flex max-h-full max-w-full items-center justify-center"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <img
              src={selectedPhoto.storageUrl}
              alt={
                selectedPhoto.filename ||
                "Gallery photo"
              }
              className="max-h-[88vh] max-w-[92vw] rounded-xl object-contain shadow-2xl"
            />

            {selectedPhoto.filename && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-4 py-2 text-xs font-medium text-white backdrop-blur-md">
                {selectedPhoto.filename}
              </div>
            )}

          </div>

        </div>
      )}

    </div>
  );
}

export default PublicGallery;