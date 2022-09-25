function toHex(c) {
  if (isNaN(c)) return "00";
  const number = parseInt(c);
  return Math.min(Math.max(0, number), 255).toString(16).padStart(2, "0");
}

function hexToRgb(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})/i.exec(hex);
  return result
    ? {
        red: parseInt(result[1], 16),
        green: parseInt(result[2], 16),
        blue: parseInt(result[3], 16),
      }
    : { red: 255, green: 255, blue: 255 };
}

function getColorFromHPPercent(hpPercent) {
  if (isNaN(hpPercent) || hpPercent >= 1.0) return "#FFFFFF";

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

  return getGradientColor(
    hexToRgb(lowColor),
    hexToRgb(highColor),
    gradientPercentage
  );
}

function getGradientColor(startColor, endColor, percentage) {
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

Hooks.on("preUpdateActor", (actor, updateData) => {
  const newHP = updateData?.system?.attributes?.hp?.value;
  const maxHP = actor?.system?.attributes?.hp?.max;
  
  if (!newHP || !maxHP || isNaN(newHP) || isNaN(newHP))
    return;

  var newColor = getColorFromHPPercent(newHP / maxHP);

  // update for unlinked tokens (typically NPCs)
  if(actor?.parent?.isEmbedded && actor?.parent?.documentName == "Token")
  {
    canvas.scene.updateEmbeddedDocuments(actor.parent.documentName,  [{
      tint: newColor,
      _id: actor.parent.id,
    }]);
  }

  // find all linked tokens in the current scene
  const applicableTokens = canvas.tokens.placeables.filter(
    (token) => token.document.actorId == actor.id && token.document.actorLink
  );
  
  // update for linked tokens (typically PCs)
  applicableTokens.forEach((token) => {
    canvas.scene.updateEmbeddedDocuments(Token.embeddedName, [{
      tint: newColor,
      _id: token.id,
    }]);
  });
});


function refresh_token_tint(token) {
  const newHP = token.actor.system.attributes.hp.value;
  const maxHP = token.actor.system.attributes.hp.max;

  if (!newHP || !maxHP || isNaN(newHP) || isNaN(newHP))
    return;

  if(newColor == token.mesh.tint.css)
      return;
  
  var newColor = getColorFromHPPercent(newHP / maxHP);
  canvas.scene.updateEmbeddedDocuments(Token.embeddedName, [{
    tint: newColor,
    _id: token.id,
  }]);  
}

Hooks.on("createToken", refresh_token_tint);
Hooks.on("refreshToken", refresh_token_tint);