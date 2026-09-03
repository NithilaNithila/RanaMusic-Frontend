import { useState } from "react";
import Input from "../components/common/Input.jsx";
import Button from "../components/common/Button.jsx";

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
    <div className="mx-auto max-w-lg animate-fadeIn">
      <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-brand-surface p-6 shadow-xl shadow-black/10 dark:shadow-black/30 sm:p-8">
        <h1 className="font-display mb-2 text-3xl font-semibold tracking-tight">Contact Us</h1>
        <p className="mb-6 text-sm text-black/50 dark:text-white/50">
          Have questions or feedback? We'd love to hear from you.
        </p>

        {submitted ? (
          <div className="rounded-xl border border-brand/20 bg-brand/10 p-6 text-center">
            <span className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-brand/20 text-brand">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </span>
            <p className="mb-1 text-lg font-semibold">Message Sent!</p>
            <p className="text-sm text-black/50 dark:text-white/50">
              Thanks for reaching out. We'll get back to you soon.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-black/60 dark:text-white/60">Name</label>
              <Input type="text" name="name" value={form.name} onChange={handleChange} required placeholder="Your name" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-black/60 dark:text-white/60">Email</label>
              <Input type="email" name="email" value={form.email} onChange={handleChange} required placeholder="you@example.com" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-black/60 dark:text-white/60">Message</label>
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                required
                rows={5}
                className="w-full resize-none rounded-xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/[0.06] px-4 py-2.5 text-sm text-black dark:text-white placeholder-black/40 dark:placeholder-white/40 outline-none transition-all duration-200 hover:border-black/20 dark:hover:border-white/20 focus:border-brand/60 focus:ring-2 focus:ring-brand/30"
                placeholder="How can we help?"
              />
            </div>
            <Button type="submit" className="mt-1 w-full">
              Send Message
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
