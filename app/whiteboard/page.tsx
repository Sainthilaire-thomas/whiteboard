import Whiteboard from "@/app/whiteboard/Whiteboard";

export default function WhiteboardPage() {
  return (
    <main className="flex justify-center items-center h-screen bg-gray-100">
      <div className="w-3/4 bg-white shadow-lg rounded-lg p-4">
        <Whiteboard />{" "}
        {/* ✅ Suppression de la prop `user`, car `Whiteboard` gère déjà l'authentification */}
      </div>
    </main>
  );
}
