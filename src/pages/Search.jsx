import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { searchTracks, getPopularTracks } from "../api/trackApi";
import { useDebounce } from "../hooks/useDebounce";
import TrackList from "../components/track/TrackList.jsx";
import Input from "../components/common/Input.jsx";
import Loader from "../components/common/Loader.jsx";

export default function Search() {
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState(params.get("q") || "");
  const [tracks, setTracks] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [loading, setLoading] = useState(false);
  const [recLoading, setRecLoading] = useState(true);
  const debouncedQuery = useDebounce(query, 400);

  useEffect(() => {
    getPopularTracks({ limit: 12 })
      .then((res) => setRecommended(res.data.results || res.data || []))
      .finally(() => setRecLoading(false));
  }, []);

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setTracks([]);
      setParams({}, { replace: true });
      return;
    }
    setParams({ q: debouncedQuery }, { replace: true });
    setLoading(true);
    searchTracks(debouncedQuery)
      .then((res) => setTracks(res.data.results || res.data))
      .catch(() => setTracks([]))
      .finally(() => setLoading(false));
  }, [debouncedQuery]);

  const searching = Boolean(debouncedQuery.trim());

  return (
    <div>
      <Input
        autoFocus
        placeholder="Search for tracks, artists..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full max-w-md mb-6"
      />

      {!searching ? (
        <div>
          <h2 className="mb-3 text-lg font-bold">Recommended for You</h2>
          {recLoading ? <Loader /> : <TrackList tracks={recommended} />}
        </div>
      ) : loading ? (
        <Loader />
      ) : (
        <TrackList tracks={tracks} />
      )}
    </div>
  );
}
