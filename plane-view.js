// Get the "plane" value from the URL, e.g. ?plane=b737 -> "b737"
const params = new URLSearchParams(window.location.search);
const planeId = params.get("plane");

// Look it up in our data file
const plane = planeData[planeId];

if (plane) {
    document.getElementById("plane-title").textContent = plane.name;
    document.getElementById("plane-image").src = plane.image;
    document.getElementById("plane-image").alt = plane.name;

    const container = document.getElementById("parts-container");

    plane.parts.forEach(part => {
        const details = document.createElement("details");

        const summary = document.createElement("summary");
        summary.textContent = part.name;

        const desc = document.createElement("p");
        desc.textContent = part.description;

        details.appendChild(summary);
        details.appendChild(desc);
        container.appendChild(details);
    });
} else {
    document.getElementById("plane-title").textContent = "Plane not found";
}