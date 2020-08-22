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

function getColor(startColor, endColor, percentage) {
  const red = (endColor.red - startColor.red) * percentage + startColor.red;
  const green =
    (endColor.green - startColor.green) * percentage + startColor.green;
  const blue = (endColor.blue - startColor.blue) * percentage + startColor.blue;
  return "#" + toHex(red) + toHex(green) + toHex(blue);
}

Hooks.on("preUpdateToken", (scene, token, updateData) => {
  const oldHP = token?.actorData?.data?.attributes?.hp;
  const newHP = updateData?.actorData?.data?.attributes?.hp;
  const maxHP = token?.actorData?.data?.attributes?.bar1?.max;

  if (oldHP && newHP && oldHP != newHP) {
    const hpPercent = newHP.value / maxHP;
    var newColor =
      hpPercent == 1.0
        ? "#FFFFFF"
        : hpPercent > 0.5
        ? getColor(
            colorTintGradient[1],
            colorTintGradient[2],
            (hpPercent - 0.5) * 2
          )
        : getColor(colorTintGradient[0], colorTintGradient[1], hpPercent * 2);

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
    const hpPercent = newHP / maxHP;
    var newColor =
      hpPercent == 1.0
        ? "#FFFFFF"
        : hpPercent > 0.5
        ? getColor(
            colorTintGradient[1],
            colorTintGradient[2],
            (hpPercent - 0.5) * 2
          )
        : getColor(colorTintGradient[0], colorTintGradient[1], hpPercent * 2);

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
