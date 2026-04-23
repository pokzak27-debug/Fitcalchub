(() => {
  "use strict";

  const SELECTORS = {
    menuToggle: ".menu-toggle",
    mainNav: ".main-nav",
    internalAnchors: 'a[href^="#"]',
  };

  function qs(selector, scope = document) {
    return scope.querySelector(selector);
  }

  function qsa(selector, scope = document) {
    return Array.from(scope.querySelectorAll(selector));
  }

  function on(element, eventName, handler, options) {
    if (!element || typeof handler !== "function") return;
    element.addEventListener(eventName, handler, options);
  }

  function toNumber(value) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : NaN;
  }

  function setOutput(element, message, type = "info") {
    if (!element) return;
    element.textContent = message;
    element.classList.remove("status-ok", "status-error");
    if (type === "success") element.classList.add("status-ok");
    if (type === "error") element.classList.add("status-error");
  }

  function setOutputHtml(element, html, type = "info") {
    if (!element) return;
    element.innerHTML = html;
    element.classList.remove("status-ok", "status-error");
    if (type === "success") element.classList.add("status-ok");
    if (type === "error") element.classList.add("status-error");
  }

  function toggleMobileNavigation() {
    const menuToggle = qs(SELECTORS.menuToggle);
    const mainNav = qs(SELECTORS.mainNav);

    if (!menuToggle || !mainNav) return;

    on(menuToggle, "click", () => {
      const isOpen = mainNav.classList.toggle("is-open");
      menuToggle.setAttribute("aria-expanded", String(isOpen));
    });
  }

  function initSmoothAnchorScroll() {
    const anchors = qsa(SELECTORS.internalAnchors);
    if (!anchors.length) return;

    anchors.forEach((anchor) => {
      on(anchor, "click", (event) => {
        const href = anchor.getAttribute("href");
        if (!href || href === "#") return;

        const target = qs(href);
        if (!target) return;

        event.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
  }

  function initGlobalInteractions() {
    toggleMobileNavigation();
    initSmoothAnchorScroll();
  }

  function getBmiCategory(bmiValue) {
    if (bmiValue < 18.5) return "Underweight";
    if (bmiValue < 25) return "Normal weight";
    if (bmiValue < 30) return "Overweight";
    return "Obesity";
  }

  function validateMetricInputs(heightCm, weightKg) {
    if (!Number.isFinite(heightCm) || !Number.isFinite(weightKg)) {
      return "Please enter valid numeric values for height and weight.";
    }
    if (heightCm < 80 || heightCm > 272) {
      return "Height must be between 80 cm and 272 cm.";
    }
    if (weightKg < 20 || weightKg > 500) {
      return "Weight must be between 20 kg and 500 kg.";
    }
    return "";
  }

  function validateCalorieInputs({ age, sex, weightKg, heightCm, activityFactor }) {
    if (!sex) return "Please select your sex.";
    if (!Number.isFinite(age) || age < 14 || age > 100) {
      return "Age must be between 14 and 100.";
    }
    if (!Number.isFinite(weightKg) || weightKg < 30 || weightKg > 300) {
      return "Weight must be between 30 kg and 300 kg.";
    }
    if (!Number.isFinite(heightCm) || heightCm < 120 || heightCm > 230) {
      return "Height must be between 120 cm and 230 cm.";
    }
    if (!Number.isFinite(activityFactor) || activityFactor < 1.2 || activityFactor > 1.9) {
      return "Please choose a valid activity level.";
    }
    return "";
  }

  function validateBmrInputs({ age, sex, weightKg, heightCm }) {
    if (!sex) return "Please select your gender.";
    if (!Number.isFinite(age) || age < 14 || age > 100) {
      return "Age must be between 14 and 100.";
    }
    if (!Number.isFinite(weightKg) || weightKg < 30 || weightKg > 300) {
      return "Weight must be between 30 kg and 300 kg.";
    }
    if (!Number.isFinite(heightCm) || heightCm < 120 || heightCm > 230) {
      return "Height must be between 120 cm and 230 cm.";
    }
    return "";
  }

  function validateIdealWeightInputs({ sex, heightCm }) {
    if (!sex) return "Please select your gender.";
    if (!Number.isFinite(heightCm) || heightCm < 120 || heightCm > 230) {
      return "Height must be between 120 cm and 230 cm.";
    }
    return "";
  }

  function validateBodyFatInputs({ sex, heightCm, neckCm, waistCm, hipCm }) {
    if (!sex) return "Please select your gender.";
    if (!Number.isFinite(heightCm) || heightCm < 120 || heightCm > 230) {
      return "Height must be between 120 cm and 230 cm.";
    }
    if (!Number.isFinite(neckCm) || neckCm < 20 || neckCm > 70) {
      return "Neck circumference must be between 20 cm and 70 cm.";
    }
    if (!Number.isFinite(waistCm) || waistCm < 30 || waistCm > 180) {
      return "Waist circumference must be between 30 cm and 180 cm.";
    }
    if (sex === "female" && (!Number.isFinite(hipCm) || hipCm < 30 || hipCm > 200)) {
      return "Hip circumference must be between 30 cm and 200 cm for female estimates.";
    }
    return "";
  }

  function calculateBmrMifflinStJeor({ age, sex, weightKg, heightCm }) {
    if (sex === "male") {
      return (10 * weightKg) + (6.25 * heightCm) - (5 * age) + 5;
    }
    return (10 * weightKg) + (6.25 * heightCm) - (5 * age) - 161;
  }

  function buildCalorieResultMarkup({ maintenance, mildLoss, moderateLoss, gain }) {
    return `
      <strong>Estimated maintenance: ${Math.round(maintenance)} kcal/day</strong><br>
      Mild weight loss (~10% deficit): ${Math.round(mildLoss)} kcal/day<br>
      Moderate weight loss (~20% deficit): ${Math.round(moderateLoss)} kcal/day<br>
      Weight gain (~10% surplus): ${Math.round(gain)} kcal/day
    `;
  }

  function calculateIdealWeightDevine({ sex, heightCm }) {
    const heightInches = heightCm / 2.54;
    const inchesOverFiveFeet = heightInches - 60;
    const baseWeight = sex === "male" ? 50 : 45.5;
    return baseWeight + (2.3 * inchesOverFiveFeet);
  }

  function cmToInches(valueCm) {
    return valueCm / 2.54;
  }

  function calculateBodyFatNavy({ sex, heightCm, neckCm, waistCm, hipCm }) {
    const heightIn = cmToInches(heightCm);
    const neckIn = cmToInches(neckCm);
    const waistIn = cmToInches(waistCm);
    const hipIn = cmToInches(hipCm);

    if (!Number.isFinite(heightIn) || heightIn <= 0) return NaN;

    if (sex === "male") {
      const maleArg = waistIn - neckIn;
      if (!Number.isFinite(maleArg) || maleArg <= 0) return NaN;
      return (86.01 * Math.log10(maleArg)) - (70.041 * Math.log10(heightIn)) + 36.76;
    }

    const femaleArg = waistIn + hipIn - neckIn;
    if (!Number.isFinite(femaleArg) || femaleArg <= 0) return NaN;
    return (163.205 * Math.log10(femaleArg)) - (97.684 * Math.log10(heightIn)) - 78.387;
  }

  function initBmiCalculator() {
    const bmiForm = qs("#bmi-form");
    const unitField = qs("#bmi-unit");
    const heightField = qs("#bmi-height");
    const weightField = qs("#bmi-weight");
    const resultField = qs("#bmi-result");

    if (!bmiForm || !heightField || !weightField || !resultField) return;

    on(bmiForm, "submit", (event) => {
      event.preventDefault();

      const selectedUnit = unitField ? unitField.value : "metric";
      if (selectedUnit !== "metric") {
        setOutput(resultField, "Imperial mode will be added soon. Please use Metric units (cm, kg).", "error");
        return;
      }

      const heightCm = toNumber(heightField.value);
      const weightKg = toNumber(weightField.value);
      const validationError = validateMetricInputs(heightCm, weightKg);

      if (validationError) {
        setOutput(resultField, validationError, "error");
        return;
      }

      const heightMeters = heightCm / 100;
      const bmi = weightKg / (heightMeters * heightMeters);

      if (!Number.isFinite(bmi) || bmi <= 0) {
        setOutput(resultField, "Unable to calculate BMI. Please check your values and try again.", "error");
        return;
      }

      const category = getBmiCategory(bmi);
      const formattedBmi = bmi.toFixed(1);
      const resultMarkup = `
        <strong>BMI: ${formattedBmi}</strong><br>
        Category: ${category}<br>
        <span>Reference range: 18.5 to 24.9 (general adult guideline)</span>
      `;
      setOutputHtml(resultField, resultMarkup, "success");
    });

    on(unitField, "change", () => {
      const selectedUnit = unitField.value;
      if (selectedUnit === "imperial") {
        heightField.placeholder = "Example: 69";
        weightField.placeholder = "Example: 154";
        setOutput(resultField, "Imperial mode will be available soon. For now, please switch back to Metric (cm, kg).");
        return;
      }

      heightField.placeholder = "Example: 175";
      weightField.placeholder = "Example: 70";
      setOutput(resultField, "Your BMI result will appear here after calculation.");
    });
  }

  function initCalorieCalculator() {
    const calorieForm = qs("#calorie-form");
    const ageField = qs("#calorie-age");
    const sexField = qs("#calorie-gender");
    const weightField = qs("#calorie-weight");
    const heightField = qs("#calorie-height");
    const bmrField = qs("#calorie-bmr");
    const activityField = qs("#calorie-activity");
    const resultField = qs("#calorie-result");

    if (!calorieForm || !resultField || !activityField) return;

    on(calorieForm, "submit", (event) => {
      event.preventDefault();

      const activityFactor = toNumber(activityField.value);
      let bmr;

      const hasDetailedFields = ageField && sexField && weightField && heightField;
      const hasBmrField = !!bmrField;

      if (hasDetailedFields) {
        const age = toNumber(ageField.value);
        const sex = sexField.value;
        const weightKg = toNumber(weightField.value);
        const heightCm = toNumber(heightField.value);

        const validationError = validateCalorieInputs({
          age,
          sex,
          weightKg,
          heightCm,
          activityFactor,
        });

        if (validationError) {
          setOutput(resultField, validationError, "error");
          return;
        }

        bmr = calculateBmrMifflinStJeor({ age, sex, weightKg, heightCm });
      } else if (hasBmrField) {
        const bmrInput = toNumber(bmrField.value);
        if (!Number.isFinite(bmrInput) || bmrInput < 800 || bmrInput > 4000) {
          setOutput(resultField, "Please enter a valid BMR between 800 and 4000 kcal/day.", "error");
          return;
        }
        if (!Number.isFinite(activityFactor) || activityFactor < 1.2 || activityFactor > 1.9) {
          setOutput(resultField, "Please choose a valid activity level.", "error");
          return;
        }
        bmr = bmrInput;
      } else {
        return;
      }
      const maintenance = bmr * activityFactor;

      if (!Number.isFinite(maintenance) || maintenance < 800 || maintenance > 7000) {
        setOutput(resultField, "Unable to estimate calories from these values. Please review your inputs.", "error");
        return;
      }

      const mildLoss = maintenance * 0.9;
      const moderateLoss = maintenance * 0.8;
      const gain = maintenance * 1.1;

      const resultMarkup = buildCalorieResultMarkup({
        maintenance,
        mildLoss,
        moderateLoss,
        gain,
      });

      setOutputHtml(resultField, resultMarkup, "success");
    });
  }

  function initBmrCalculator() {
    const bmrForm = qs("#bmr-form");
    const ageField = qs("#bmr-age");
    const sexField = qs("#bmr-sex");
    const weightField = qs("#bmr-weight");
    const heightField = qs("#bmr-height");
    const resultField = qs("#bmr-result");

    if (!bmrForm || !ageField || !sexField || !weightField || !heightField || !resultField) return;

    on(bmrForm, "submit", (event) => {
      event.preventDefault();

      const age = toNumber(ageField.value);
      const sex = sexField.value;
      const weightKg = toNumber(weightField.value);
      const heightCm = toNumber(heightField.value);

      const validationError = validateBmrInputs({
        age,
        sex,
        weightKg,
        heightCm,
      });

      if (validationError) {
        setOutput(resultField, validationError, "error");
        return;
      }

      const bmr = calculateBmrMifflinStJeor({ age, sex, weightKg, heightCm });
      if (!Number.isFinite(bmr) || bmr < 800 || bmr > 4000) {
        setOutput(resultField, "Unable to estimate BMR from these values. Please review your inputs.", "error");
        return;
      }

      const resultMarkup = `
        <strong>Estimated BMR: ${Math.round(bmr)} kcal/day</strong><br>
        <span>This is your baseline daily energy need at rest.</span>
      `;
      setOutputHtml(resultField, resultMarkup, "success");
    });
  }

  function initIdealWeightCalculator() {
    const idealWeightForm = qs("#ideal-weight-form");
    const sexField = qs("#iw-sex");
    const heightField = qs("#iw-height");
    const unitField = qs("#iw-unit");
    const resultField = qs("#ideal-weight-result");

    if (!idealWeightForm || !sexField || !heightField || !resultField) return;

    on(idealWeightForm, "submit", (event) => {
      event.preventDefault();

      const selectedUnit = unitField ? unitField.value : "metric";
      if (selectedUnit !== "metric") {
        setOutput(resultField, "Imperial mode will be added soon. Please use Metric units (cm).", "error");
        return;
      }

      const sex = sexField.value;
      const heightCm = toNumber(heightField.value);

      const validationError = validateIdealWeightInputs({
        sex,
        heightCm,
      });

      if (validationError) {
        setOutput(resultField, validationError, "error");
        return;
      }

      const idealWeightKg = calculateIdealWeightDevine({ sex, heightCm });
      if (!Number.isFinite(idealWeightKg) || idealWeightKg < 30 || idealWeightKg > 200) {
        setOutput(resultField, "Unable to estimate ideal weight from these values. Please review your inputs.", "error");
        return;
      }

      const resultMarkup = `
        <strong>Estimated ideal weight: ${idealWeightKg.toFixed(1)} kg</strong><br>
        <span>Based on the Devine formula (general reference estimate).</span>
      `;
      setOutputHtml(resultField, resultMarkup, "success");
    });

    on(unitField, "change", () => {
      if (unitField.value === "imperial") {
        heightField.placeholder = "Example: 69";
        setOutput(resultField, "Imperial mode will be available soon. For now, please switch back to Metric (cm).");
        return;
      }
      heightField.placeholder = "Example: 175";
      setOutput(resultField, "Your ideal weight estimate will appear here after calculation.");
    });
  }

  function initBodyFatCalculator() {
    const bodyFatForm = qs("#body-fat-form");
    const unitField = qs("#bf-unit");
    const sexField = qs("#bf-sex");
    const heightField = qs("#bf-height");
    const neckField = qs("#bf-neck");
    const waistField = qs("#bf-waist");
    const hipField = qs("#bf-hip");
    const resultField = qs("#body-fat-result");

    if (!bodyFatForm || !sexField || !heightField || !neckField || !waistField || !hipField || !resultField) return;

    on(bodyFatForm, "submit", (event) => {
      event.preventDefault();

      const selectedUnit = unitField ? unitField.value : "metric";
      if (selectedUnit !== "metric") {
        setOutput(resultField, "Imperial mode will be added soon. Please use Metric units (cm).", "error");
        return;
      }

      const sex = sexField.value;
      const heightCm = toNumber(heightField.value);
      const neckCm = toNumber(neckField.value);
      const waistCm = toNumber(waistField.value);
      const hipCm = toNumber(hipField.value);

      const validationError = validateBodyFatInputs({
        sex,
        heightCm,
        neckCm,
        waistCm,
        hipCm,
      });

      if (validationError) {
        setOutput(resultField, validationError, "error");
        return;
      }

      const bodyFatPercent = calculateBodyFatNavy({
        sex,
        heightCm,
        neckCm,
        waistCm,
        hipCm,
      });

      if (!Number.isFinite(bodyFatPercent) || bodyFatPercent <= 2 || bodyFatPercent >= 75) {
        setOutput(resultField, "Unable to estimate body fat from these measurements. Please review your inputs.", "error");
        return;
      }

      const resultMarkup = `
        <strong>Estimated body fat: ${bodyFatPercent.toFixed(1)}%</strong><br>
        <span>Based on the U.S. Navy circumference formula (general estimate).</span>
      `;
      setOutputHtml(resultField, resultMarkup, "success");
    });

    on(unitField, "change", () => {
      if (unitField.value === "imperial") {
        heightField.placeholder = "Example: 69";
        neckField.placeholder = "Example: 15";
        waistField.placeholder = "Example: 33";
        hipField.placeholder = "Example: 38";
        setOutput(resultField, "Imperial mode will be available soon. For now, please switch back to Metric (cm).");
        return;
      }
      heightField.placeholder = "Example: 175";
      neckField.placeholder = "Example: 38";
      waistField.placeholder = "Example: 84";
      hipField.placeholder = "Example: 98";
      setOutput(resultField, "Your body fat estimate will appear here after calculation.");
    });
  }

  function initContactForm() {
    const contactForm = qs("#contact-form");
    const resultField = qs("#contact-result");
    const nameField = qs("#contact-name");
    const emailField = qs("#contact-email");
    const messageField = qs("#contact-message");

    if (!contactForm || !resultField || !nameField || !emailField || !messageField) return;

    on(contactForm, "submit", (event) => {
      event.preventDefault();

      const name = nameField.value.trim();
      const email = emailField.value.trim();
      const message = messageField.value.trim();

      if (!name || !email || !message) {
        setOutput(resultField, "Please complete name, email, and message before submitting.", "error");
        return;
      }

      const subject = encodeURIComponent(`FitCalculatorHub contact from ${name}`);
      const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`);
      const mailtoUrl = `mailto:contact@fitcalculatorhub.com?subject=${subject}&body=${body}`;

      setOutput(resultField, "Opening your email app with a prefilled draft...", "success");
      window.location.href = mailtoUrl;
    });
  }

  function init() {
    initGlobalInteractions();
    initBmiCalculator();
    initCalorieCalculator();
    initBmrCalculator();
    initIdealWeightCalculator();
    initBodyFatCalculator();
    initContactForm();

    /*
      Future BMAD calculator modules:
      - import/init calculator-specific scripts per page
      - keep formulas and validation isolated from global UI behavior
      - example: initBmiCalculator(), initBmrCalculator(), etc.
    */
  }

  if (document.readyState === "loading") {
    on(document, "DOMContentLoaded", init);
  } else {
    init();
  }
})();
