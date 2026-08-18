import { useState } from "react";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="mx-auto max-w-lg">
      <div className="rounded-2xl bg-brand-surface border border-white/10 p-6">
        <h1 className="text-2xl font-bold mb-2">Contact Us</h1>
        <p className="text-white/50 text-sm mb-6">
          Have questions or feedback? We'd love to hear from you.
        </p>

        {submitted ? (
          <div className="rounded-xl bg-white/5 p-6 text-center">
            <p className="text-lg font-semibold mb-1">Message Sent!</p>
            <p className="text-white/50 text-sm">
              Thanks for reaching out. We'll get back to you soon.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm text-white/60 mb-1">Name</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:border-brand transition-colors"
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="block text-sm text-white/60 mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:border-brand transition-colors"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-sm text-white/60 mb-1">Message</label>
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                required
                rows={5}
                className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:border-brand transition-colors resize-none"
                placeholder="How can we help?"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-full bg-brand py-2.5 text-sm font-semibold text-black transition-opacity hover:opacity-90"
            >
              Send Message
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
