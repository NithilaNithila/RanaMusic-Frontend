import { useState } from "react";
import Modal from "../common/Modal.jsx";
import Input from "../common/Input.jsx";
import Button from "../common/Button.jsx";
import { createPlaylist } from "../../api/playlistApi";

export default function CreatePlaylistModal({ open, onClose, onCreated }) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setError("");
    try {
      const { data } = await createPlaylist({ name: name.trim() });
      onCreated?.(data);
      setName("");
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create playlist");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="New Playlist">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <Input
          autoFocus
          placeholder="Playlist name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        {error && <p className="text-red-400 text-xs">{error}</p>}
        <Button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create"}
        </Button>
      </form>
    </Modal>
  );
}
