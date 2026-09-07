import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { verifyGalleryPin } from "../../services/publicGallery.service";

function GalleryAccess() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [pin, setPin] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!/^\d{4,6}$/.test(pin)) {
      setError("Enter a valid 4 to 6 digit PIN.");
      return;
    }

    try {
      setIsLoading(true);
      setError("");

      const response = await verifyGalleryPin(
        slug,
        pin
      );

      const galleryToken =
        response.token ||
        response.data?.token;

      if (!galleryToken) {
        setError(
          "Unable to open the gallery. Please try again."
        );
        return;
      }

      // Keep the token for refreshes/new navigation.
      sessionStorage.setItem(
        `gallery_token_${slug}`,
        galleryToken
      );

      // Pass the token directly to the next route.
      // This avoids depending only on sessionStorage
      // during the immediate route transition.
      navigate(`/gallery/${slug}/view`, {
        replace: true,
        state: {
          galleryToken,
        },
      });
    } catch (err) {
      console.error(
        "Gallery verification failed:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Incorrect PIN. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-5">

      <div className="w-full max-w-md">

        <div className="mb-8 text-center">

          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-2xl shadow-xl">
            ✦
          </div>

          <h1 className="mt-5 text-2xl font-bold tracking-tight text-white">
            Private Gallery
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            Enter the PIN provided by your photographer.
          </p>

        </div>

        <div className="rounded-3xl border border-white/10 bg-white p-7 shadow-2xl">

          <form onSubmit={handleSubmit}>

            <label className="text-sm font-semibold text-slate-800">
              Gallery PIN
            </label>

            <input
              type="password"
              inputMode="numeric"
              autoComplete="off"
              maxLength={6}
              value={pin}
              onChange={(event) => {
                const value =
                  event.target.value.replace(
                    /\D/g,
                    ""
                  );

                setPin(value);
                setError("");
              }}
              placeholder="••••"
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-center text-2xl font-bold tracking-[0.5em] text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white"
            />

            {error && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={
                isLoading ||
                pin.length < 4
              }
              className="mt-5 w-full rounded-2xl bg-slate-900 px-5 py-4 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isLoading
                ? "Opening gallery..."
                : "Open Gallery →"}
            </button>

          </form>

        </div>

        <p className="mt-6 text-center text-xs text-slate-500">
          This gallery is private and protected by a PIN.
        </p>

      </div>

    </div>
  );
}

export default GalleryAccess;