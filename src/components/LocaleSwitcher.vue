<template>
  <div class="locale-switcher">
    <select v-model="$i18n.locale">
      <option value="en">English</option>
      <option value="de">Deutsche</option>
	  <option value="es">Español</option>
    </select>
  </div>
</template>