import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import { useState } from "react";

export default function MapView({ students, setHomeDest }) {
  const [home, setHome] = useState(null);
  const [dest, setDest] = useState(null);

  function ClickHandler() {
    useMapEvents({
      click(e) {
        let newHome = home;
        let newDest = dest;

        if (!home) {
          newHome = e.latlng;
          setHome(newHome);
        } else if (!dest) {
          newDest = e.latlng;
          setDest(newDest);
        } else {
          // Reset if both are already set
          newHome = e.latlng;
          newDest = null;
          setHome(newHome);
          setDest(null);
        }

        // Pass **the new values directly** to parent
        setHomeDest({ home: newHome, dest: newDest });
      },
    });
    return null;
  }

  return (
    <MapContainer center={[19.2, 72.8]} zoom={12} style={{ height: "400px", width: "100%" }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />
      <ClickHandler />

      {home && <Marker position={home}><Popup>Your Home</Popup></Marker>}
      {dest && <Marker position={dest}><Popup>Your Destination</Popup></Marker>}

      {students.map(s => (
        s.home ? (
          <Marker key={s._id} position={[s.home.lat, s.home.lng]}>
            <Popup>
              {s.username} <br/> Destination: {s.dest?.lat.toFixed(4)}, {s.dest?.lng.toFixed(4)}
            </Popup>
          </Marker>
        ) : null
      ))}
    </MapContainer>
  );
}
