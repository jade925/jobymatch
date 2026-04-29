"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Map, AdvancedMarker } from "@vis.gl/react-google-maps";
import { MapProvider } from "@/components/MapProvider";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { MapPin } from "lucide-react";

const DAYS = ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"];
const SKILLS_SUGGESTIONS = ["Service en salle", "Caisse", "Cuisine", "Manutention", "Vente", "Accueil", "Conduite", "Informatique", "Langues", "Communication"];
const JOB_TYPES = ["Restauration", "Commerce", "Événementiel", "Services", "Livraison", "Hôtellerie", "Autre"];

type ScheduleEntry = { start: string; end: string };

type FormData = {
  title: string;
  description: string;
  requiredSkills: string[];
  jobType: string;
  startDate: string;
  endDate: string;
  schedules: Record<string, ScheduleEntry | null>;
  hourlyRate: number;
  location: string;
  latitude: number | null;
  longitude: number | null;
  nbPositions: number;
};

type OfferFormProps = {
  initialData?: Partial<FormData>;
  offerId?: string;
  mode: "create" | "edit";
};

export function OfferForm({ initialData, offerId, mode }: OfferFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState<FormData>({
    title: initialData?.title || "",
    description: initialData?.description || "",
    requiredSkills: initialData?.requiredSkills || [],
    jobType: initialData?.jobType || "",
    startDate: initialData?.startDate || "",
    endDate: initialData?.endDate || "",
    schedules: initialData?.schedules || {},
    hourlyRate: initialData?.hourlyRate || 11.88,
    location: initialData?.location || "",
    latitude: initialData?.latitude || null,
    longitude: initialData?.longitude || null,
    nbPositions: initialData?.nbPositions || 1,
  });

  function toggleSkill(skill: string) {
    setForm((f) => ({
      ...f,
      requiredSkills: f.requiredSkills.includes(skill)
        ? f.requiredSkills.filter((s) => s !== skill)
        : [...f.requiredSkills, skill],
    }));
  }

  function toggleDay(day: string) {
    setForm((f) => {
      const schedules = { ...f.schedules };
      if (schedules[day]) {
        delete schedules[day];
      } else {
        schedules[day] = { start: "09:00", end: "17:00" };
      }
      return { ...f, schedules };
    });
  }

  function setDayTime(day: string, field: "start" | "end", value: string) {
    setForm((f) => ({
      ...f,
      schedules: {
        ...f.schedules,
        [day]: { ...(f.schedules[day] || { start: "09:00", end: "17:00" }), [field]: value },
      },
    }));
  }

  async function handleGeocodeAddress() {
    if (!form.location) return;
    try {
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(form.location)}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
      );
      const data = await res.json();
      if (data.results?.[0]?.geometry?.location) {
        const { lat, lng } = data.results[0].geometry.location;
        setForm((f) => ({ ...f, latitude: lat, longitude: lng }));
      }
    } catch {}
  }

  async function handleSubmit() {
    setLoading(true);
    setError("");

    try {
      const url = mode === "create" ? "/api/offers" : `/api/offers/${offerId}`;
      const method = mode === "create" ? "POST" : "PATCH";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Erreur");
        setLoading(false);
        return;
      }

      router.push("/company/offers");
      router.refresh();
    } catch {
      setError("Erreur réseau");
      setLoading(false);
    }
  }

  const mapCenter = form.latitude && form.longitude
    ? { lat: form.latitude, lng: form.longitude }
    : { lat: 48.8566, lng: 2.3522 };

  return (
    <div className="flex flex-col gap-5 px-4 py-5">
      {error && (
        <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{error}</p>
      )}

      <div className="flex flex-col gap-3">
        <Input
          placeholder="Intitulé du poste"
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          className="rounded-xl h-12"
        />

        <Textarea
          placeholder="Description du poste..."
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          className="rounded-xl min-h-24"
          rows={4}
        />
      </div>

      {/* Compétences */}
      <div>
        <p className="font-sans font-light text-sm mb-2" style={{ color: "#6b7280" }}>Compétences requises</p>
        <div className="flex flex-wrap gap-2">
          {SKILLS_SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => toggleSkill(s)}
              className="px-3 py-1.5 rounded-full text-xs font-sans font-light border"
              style={
                form.requiredSkills.includes(s)
                  ? { backgroundColor: "#FD8F03", color: "white", borderColor: "#FD8F03" }
                  : { backgroundColor: "white", color: "#393E41", borderColor: "#e2e3d8" }
              }
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Job type */}
      <div>
        <p className="font-sans font-light text-sm mb-2" style={{ color: "#6b7280" }}>Type de job</p>
        <div className="flex flex-wrap gap-2">
          {JOB_TYPES.map((jt) => (
            <button
              key={jt}
              type="button"
              onClick={() => setForm((f) => ({ ...f, jobType: f.jobType === jt ? "" : jt }))}
              className="px-3 py-1.5 rounded-full text-xs font-sans font-light border"
              style={
                form.jobType === jt
                  ? { backgroundColor: "#2292A4", color: "white", borderColor: "#2292A4" }
                  : { backgroundColor: "white", color: "#393E41", borderColor: "#e2e3d8" }
              }
            >
              {jt}
            </button>
          ))}
        </div>
      </div>

      {/* Dates */}
      <div className="flex gap-3">
        <div className="flex-1">
          <p className="font-sans font-light text-xs mb-1" style={{ color: "#6b7280" }}>Début</p>
          <Input type="date" value={form.startDate} onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))} className="rounded-xl h-11" />
        </div>
        <div className="flex-1">
          <p className="font-sans font-light text-xs mb-1" style={{ color: "#6b7280" }}>Fin</p>
          <Input type="date" value={form.endDate} onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))} className="rounded-xl h-11" />
        </div>
      </div>

      {/* Horaires */}
      <div>
        <p className="font-sans font-light text-sm mb-2" style={{ color: "#6b7280" }}>Horaires par jour</p>
        <div className="space-y-2">
          {DAYS.map((day) => (
            <div key={day} className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => toggleDay(day)}
                className="w-10 h-7 rounded-full text-xs font-sans font-light capitalize flex-shrink-0"
                style={
                  form.schedules[day]
                    ? { backgroundColor: "#FD8F03", color: "white" }
                    : { backgroundColor: "#e2e3d8", color: "#9ca3af" }
                }
              >
                {day.slice(0, 3)}
              </button>
              {form.schedules[day] && (
                <div className="flex items-center gap-1 flex-1">
                  <Input
                    type="time"
                    value={form.schedules[day]!.start}
                    onChange={(e) => setDayTime(day, "start", e.target.value)}
                    className="rounded-lg h-8 text-xs"
                  />
                  <span className="text-xs" style={{ color: "#9ca3af" }}>–</span>
                  <Input
                    type="time"
                    value={form.schedules[day]!.end}
                    onChange={(e) => setDayTime(day, "end", e.target.value)}
                    className="rounded-lg h-8 text-xs"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Rémunération */}
      <div>
        <p className="font-sans font-light text-sm mb-2" style={{ color: "#6b7280" }}>
          Rémunération : <strong style={{ color: "#FD8F03" }}>{form.hourlyRate.toFixed(2)} €/h</strong>
        </p>
        <Slider
          min={11.88}
          max={30}
          step={0.1}
          value={[form.hourlyRate]}
          onValueChange={(vals) => setForm((f) => ({ ...f, hourlyRate: Array.isArray(vals) ? vals[0] : vals }))}
          className="my-2"
        />
      </div>

      {/* Lieu */}
      <div>
        <p className="font-sans font-light text-sm mb-2" style={{ color: "#6b7280" }}>Lieu</p>
        <div className="flex gap-2">
          <Input
            placeholder="Adresse de la mission"
            value={form.location}
            onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
            className="rounded-xl h-12 flex-1"
          />
          <button
            type="button"
            onClick={handleGeocodeAddress}
            className="px-3 h-12 rounded-xl"
            style={{ backgroundColor: "#F6F7EB", color: "#2292A4" }}
          >
            <MapPin size={18} />
          </button>
        </div>
        {form.latitude && form.longitude && (
          <MapProvider>
          <div className="rounded-2xl overflow-hidden mt-3" style={{ height: 200 }}>
            <Map
              defaultCenter={mapCenter}
              defaultZoom={15}
              gestureHandling="cooperative"
              disableDefaultUI
              mapId="offer-form-map"
            >
              <AdvancedMarker position={mapCenter}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center shadow" style={{ backgroundColor: "#FD8F03" }}>
                  <MapPin size={14} color="white" />
                </div>
              </AdvancedMarker>
            </Map>
          </div>
          </MapProvider>
        )}
      </div>

      {/* Nb postes */}
      <div>
        <p className="font-sans font-light text-sm mb-2" style={{ color: "#6b7280" }}>Nombre de postes</p>
        <Input
          type="number"
          min={1}
          max={99}
          value={form.nbPositions}
          onChange={(e) => setForm((f) => ({ ...f, nbPositions: parseInt(e.target.value) || 1 }))}
          className="rounded-xl h-12 w-24"
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3 pb-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex-1 py-4 rounded-xl border font-sans font-light text-sm"
          style={{ borderColor: "#d1d5db", color: "#9ca3af" }}
        >
          Annuler
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="flex-1 py-4 rounded-xl text-white font-heading text-base disabled:opacity-60"
          style={{ backgroundColor: "#FD8F03" }}
        >
          {loading ? "Envoi..." : mode === "create" ? "Publier l'offre" : "Sauvegarder"}
        </button>
      </div>
    </div>
  );
}
