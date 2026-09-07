import { useEffect, useState } from "react";

import AdminLayout from "../../components/layout/AdminLayout";

import {
  createTeamMember,
  getTeamMembers,
} from "../../services/event.service";

const TeamMembers = () => {
  const [teamMembers, setTeamMembers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [formError, setFormError] = useState("");
  const [creating, setCreating] = useState(false);

  const loadTeamMembers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getTeamMembers();

      setTeamMembers(response.teamMembers || []);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to load team members"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeamMembers();
  }, []);

  const handleChange = (event) => {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setCreating(true);
      setFormError("");

      await createTeamMember(form);

      setForm({
        name: "",
        email: "",
        password: "",
      });

      await loadTeamMembers();
    } catch (error) {
      setFormError(
        error.response?.data?.message ||
          "Failed to create team member"
      );
    } finally {
      setCreating(false);
    }
  };

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Team Members
        </h1>

        <p className="mt-2 text-gray-500">
          Create and manage your photography team members.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Create Team Member */}
        <section className="rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900">
            Add Team Member
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Create an account that can later be assigned to
            events.
          </p>

          <form
            onSubmit={handleSubmit}
            className="mt-6 space-y-4"
          >
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Name
              </label>

              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                minLength={2}
                maxLength={50}
                className="w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-gray-300"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Email
              </label>

              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-gray-300"
                placeholder="john@example.com"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Password
              </label>

              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                minLength={6}
                maxLength={100}
                className="w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-gray-300"
                placeholder="Minimum 6 characters"
              />
            </div>

            {formError && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                {formError}
              </div>
            )}

            <button
              type="submit"
              disabled={creating}
              className="w-full rounded-lg bg-gray-900 px-4 py-2.5 font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {creating ? "Creating..." : "Create Team Member"}
            </button>
          </form>
        </section>

        {/* Team Member List */}
        <section className="lg:col-span-2">
          <h2 className="mb-4 text-xl font-semibold text-gray-900">
            All Team Members
          </h2>

          {loading && (
            <p className="text-gray-500">
              Loading team members...
            </p>
          )}

          {error && (
            <div className="rounded-lg bg-red-50 p-4 text-red-600">
              {error}
            </div>
          )}

          {!loading &&
            !error &&
            teamMembers.length === 0 && (
              <div className="rounded-xl border border-dashed bg-white p-8 text-center text-gray-500">
                No team members created yet.
              </div>
            )}

          <div className="space-y-3">
            {teamMembers.map((member) => (
              <div
                key={member._id}
                className="rounded-xl border bg-white p-5 shadow-sm"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {member.name}
                    </h3>

                    <p className="mt-1 text-sm text-gray-500">
                      {member.email}
                    </p>
                  </div>

                  <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                    Team Member
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </AdminLayout>
  );
};

export default TeamMembers;