/** Displays announcement messages configured in the alerts JSON file. */
export default class Alert {
  constructor(
    alertSource = `${import.meta.env?.BASE_URL || "./public/"}json/alerts.json`,
    parentElement = document.querySelector("main"),
  ) {
    this.alertSource = alertSource;
    this.parentElement = parentElement;
  }

  async init() {
    if (!this.parentElement) return;

    try {
      const response = await fetch(this.alertSource);
      if (!response.ok) throw new Error(`Unable to load alerts: ${response.status}`);

      const alerts = await response.json();
      this.renderAlerts(alerts);
    } catch (error) {
      console.error("Alerts could not be displayed.", error);
    }
  }

  renderAlerts(alerts) {
    if (!Array.isArray(alerts) || alerts.length === 0) return;

    const alertList = document.createElement("section");
    alertList.className = "alert-list";
    alertList.setAttribute("aria-label", "Announcements");

    alerts.forEach(({ message, background, color }) => {
      const alert = document.createElement("p");
      alert.textContent = message;
      alert.style.backgroundColor = background;
      alert.style.color = color;
      alertList.append(alert);
    });

    this.parentElement.prepend(alertList);
  }
}
