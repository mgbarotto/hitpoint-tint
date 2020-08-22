const colorTintGradient = [
  { red: 252, green: 50, blue: 10 },
  { red: 252, green: 171, blue: 10 },
  { red: 212, green: 252, blue: 10 },
];

function toHex(c) {
  var s = "0123456789abcdef";
  var i = parseInt(c);
  if (i == 0 || isNaN(c)) return "00";
  i = Math.round(Math.min(Math.max(0, i), 255));
  return s.charAt((i - (i % 16)) / 16) + s.charAt(i % 16);
}
function hexToRgb(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})/i.exec(hex);
  return result
    ? {
        red: parseInt(result[1], 16),
        green: parseInt(result[2], 16),
        blue: parseInt(result[3], 16),
      }
    : null;
}

function getColorFromHPPercent(hpPercent) {
  if (hpPercent >= 1.0) {
    return "#FFFFFF";
  }

  const lowColor =
    hpPercent > 0.5
      ? game.settings.get("hitpoint-tint", "MidHPColor")
      : game.settings.get("hitpoint-tint", "LowHPColor");

  const highColor =
    hpPercent > 0.5
      ? game.settings.get("hitpoint-tint", "HighHPColor")
      : game.settings.get("hitpoint-tint", "MidHPColor");
  const gradientPercentage =
    hpPercent > 0.5 ? (hpPercent - 0.5) * 2 : hpPercent * 2;
  console.log(hpPercent);
  console.log(lowColor);
  console.log(highColor);
  console.log(gradientPercentage);

  return getColor(hexToRgb(lowColor), hexToRgb(highColor), gradientPercentage);
}

function getColor(startColor, endColor, percentage) {
  const red = (endColor.red - startColor.red) * percentage + startColor.red;
  const green =
    (endColor.green - startColor.green) * percentage + startColor.green;
  const blue = (endColor.blue - startColor.blue) * percentage + startColor.blue;
  return "#" + toHex(red) + toHex(green) + toHex(blue);
}

Hooks.once("ready", () => {
  try {
    window.Ardittristan.ColorSetting.tester;
  } catch {
    ui.notifications.notify(
      'Please make sure you have the "lib - ColorSettings" module installed and enabled.',
      "error",
      { permanent: true }
    );
  }

  new window.Ardittristan.ColorSetting("hitpoint-tint", "HighHPColor", {
    name: "High HP Color", // The name of the setting in the settings menu
    hint: "The color to tint tokens at high hitpoints", // A description of the registered setting and its behavior
    label: "Select High HP Color", // The text label used in the button
    restricted: true, // Restrict this setting to gamemaster only?
    defaultColor: "#D4FC0A", // The default color of the setting
    scope: "world", // The scope of the setting
    onChange: (value) => {}, // A callback function which triggers when the setting is changed
  });
  new window.Ardittristan.ColorSetting("hitpoint-tint", "MidHPColor", {
    name: "Mid HP Color", // The name of the setting in the settings menu
    hint: "The color to tint tokens at mid hitpoints", // A description of the registered setting and its behavior
    label: "Select Mid HP Color", // The text label used in the button
    restricted: true, // Restrict this setting to gamemaster only?
    defaultColor: "#FCAB0A", // The default color of the setting
    scope: "world", // The scope of the setting
    onChange: (value) => {}, // A callback function which triggers when the setting is changed
  });
  new window.Ardittristan.ColorSetting("hitpoint-tint", "LowHPColor", {
    name: "Low HP Color", // The name of the setting in the settings menu
    hint: "The color to tint tokens at low hitpoints", // A description of the registered setting and its behavior
    label: "Select Low HP Color", // The text label used in the button
    restricted: true, // Restrict this setting to gamemaster only?
    defaultColor: "#FC320A", // The default color of the setting
    scope: "world", // The scope of the setting
    onChange: (value) => {}, // A callback function which triggers when the setting is changed
  });
});

Hooks.on("preUpdateToken", (scene, token, updateData) => {
  const oldHP = token?.actorData?.data?.attributes?.hp.value;
  const newHP = updateData?.actorData?.data?.attributes?.hp.value;
  const maxHP = token?.actorData?.data?.attributes?.bar1?.max;

  if (oldHP && newHP && oldHP != newHP) {
    var newColor = getColorFromHPPercent(newHP / maxHP);

    console.log("Hitpoints changed");
    console.log(newColor);

    scene.updateEmbeddedEntity(Token.embeddedName, {
      tint: newColor,
      _id: token._id,
    });
  }
});

Hooks.on("preUpdateActor", (actor, updateData) => {
  const oldHP = actor?.data?.data?.attributes?.hp?.value;
  const newHP = updateData?.data?.attributes?.hp?.value;
  const maxHP = actor?.data?.data?.attributes?.hp?.max;

  if (oldHP && newHP && oldHP != newHP) {
    var newColor = getColorFromHPPercent(newHP / maxHP);

    console.log(`Hitpoints changed ${oldHP} to ${newHP}`);
    console.log(newColor);

    const applicableTokens = canvas.tokens.placeables.filter(
      (token) => token.data.actorId == actor.id
    );

    actor.data.token.tint = newColor;

    applicableTokens.forEach((token) => {
      canvas.scene.updateEmbeddedEntity(Token.embeddedName, {
        tint: newColor,
        _id: token.data._id,
      });
    });
  }
});
