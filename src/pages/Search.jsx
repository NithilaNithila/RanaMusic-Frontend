import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { searchTracks } from "../api/trackApi";
import { useDebounce } from "../hooks/useDebounce";
import TrackList from "../components/track/TrackList.jsx";
import Input from "../components/common/Input.jsx";
import Loader from "../components/common/Loader.jsx";

export default function Search() {
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState(params.get("q") || "");
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(false);
  const debouncedQuery = useDebounce(query, 400);

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setTracks([]);
      return;
    }
    setParams({ q: debouncedQuery });
    setLoading(true);
    searchTracks(debouncedQuery)
      .then((res) => setTracks(res.data.results || res.data))
      .catch(() => setTracks([]))
      .finally(() => setLoading(false));
  }, [debouncedQuery]);

  return (
    <div>
      <Input
        autoFocus
        placeholder="Search for tracks, artists..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full max-w-md mb-6"
      />
      {loading ? <Loader /> : <TrackList tracks={tracks} />}
    </div>
  );
}
