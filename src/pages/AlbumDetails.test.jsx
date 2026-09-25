import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";

const routerState = vi.hoisted(() => ({ id: "null", source: null }));
const albumApi = vi.hoisted(() => ({
  getAlbumById: vi.fn(),
  getAlbumTracks: vi.fn(),
  getCatalogAlbum: vi.fn(),
  getCatalogAlbumTracks: vi.fn(),
  isCatalogAlbumSource: vi.fn(() => false),
}));

vi.mock("react-router-dom", () => ({
  useParams: () => ({ id: routerState.id }),
  useSearchParams: () => [
    new URLSearchParams(routerState.source ? { source: routerState.source } : {}),
    vi.fn(),
  ],
}));

vi.mock("../api/albumApi", () => albumApi);
vi.mock("../hooks/useAudioPlayer", () => ({
  usePlayer: () => ({ playTrack: vi.fn() }),
}));

import AlbumDetails from "./AlbumDetails.jsx";

afterEach(() => cleanup());

beforeEach(() => {
  routerState.id = "null";
  routerState.source = null;
  vi.clearAllMocks();
  albumApi.isCatalogAlbumSource.mockReturnValue(false);
});

describe("AlbumDetails", () => {
  it.each(["null", " NULL ", "undefined", ""])("does not request tracks for id %j", async (id) => {
    routerState.id = id;
    render(<AlbumDetails />);

    await waitFor(() => expect(screen.getByText("Album not found.")).toBeInTheDocument());
    expect(albumApi.getAlbumById).not.toHaveBeenCalled();
    expect(albumApi.getAlbumTracks).not.toHaveBeenCalled();
    expect(albumApi.getCatalogAlbum).not.toHaveBeenCalled();
    expect(albumApi.getCatalogAlbumTracks).not.toHaveBeenCalled();
  });

  it("requests default-source album data with the trimmed id", async () => {
    routerState.id = "  al1  ";
    albumApi.getAlbumById.mockResolvedValue({ data: { name: "Album", image: "" } });
    albumApi.getAlbumTracks.mockResolvedValue({ data: [] });

    render(<AlbumDetails />);

    await waitFor(() => expect(albumApi.getAlbumById).toHaveBeenCalledWith("al1"));
    expect(albumApi.getAlbumTracks).toHaveBeenCalledWith("al1");
    expect(albumApi.getCatalogAlbum).not.toHaveBeenCalled();
    expect(albumApi.getCatalogAlbumTracks).not.toHaveBeenCalled();
  });

  it("requests catalog album data with its source and id", async () => {
    routerState.id = "spotify-al1";
    routerState.source = "spotify";
    albumApi.isCatalogAlbumSource.mockImplementation((source) => source === "spotify");
    albumApi.getCatalogAlbum.mockResolvedValue({ data: { name: "Album", image: "" } });
    albumApi.getCatalogAlbumTracks.mockResolvedValue({ data: [] });

    render(<AlbumDetails />);

    await waitFor(() =>
      expect(albumApi.getCatalogAlbum).toHaveBeenCalledWith("spotify", "spotify-al1")
    );
    expect(albumApi.getCatalogAlbumTracks).toHaveBeenCalledWith("spotify", "spotify-al1");
    expect(albumApi.getAlbumById).not.toHaveBeenCalled();
    expect(albumApi.getAlbumTracks).not.toHaveBeenCalled();
  });
});
