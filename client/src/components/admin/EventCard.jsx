import { Link } from "react-router-dom";

const EventCard = ({ event }) => {
  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {event.name}
          </h3>

          <p className="mt-1 text-sm text-gray-500">
            {event.description || "No description"}
          </p>

          <p className="mt-3 text-sm text-gray-600">
            Event date:{" "}
            {new Date(
              event.eventDate
            ).toLocaleDateString()}
          </p>

          <p className="mt-1 text-sm text-gray-600">
            Team members:{" "}
            {event.teamMembers?.length || 0}
          </p>
        </div>

        <Link
          to={`/admin/events/${event._id}`}
          className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          Open
        </Link>
      </div>
    </div>
  );
};

export default EventCard;