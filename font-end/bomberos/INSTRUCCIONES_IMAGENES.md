# 📸 INSTRUCCIONES PARA AGREGAR IMÁGENES DE BOMBEROS VOLUNTARIOS

## 📁 Ubicación de las Imágenes

Debes colocar tus imágenes en esta carpeta:

```
C:\Users\Rafael\Proyecto_bomberos\font-end\bomberos\public\images\
```

## 🖼️ Imágenes Necesarias

### 1. **Logo de Bomberos Voluntarios** (Logo 360°)

**Nombre del archivo:** `logo-bomberos.png`

**Ubicación completa:**
```
C:\Users\Rafael\Proyecto_bomberos\font-end\bomberos\public\images\logo-bomberos.png
```

**Especificaciones:**
- ✅ Formato: PNG (con fondo transparente es mejor)
- ✅ Tamaño recomendado: 200x200 px (cuadrado)
- ✅ Resolución: Mínimo 150 DPI
- ✅ Peso: Menos de 500 KB

**Dónde se muestra:**
- En el centro de la página de login (logo circular con efecto 360°)
- En el header del panel izquierdo (versión pequeña)

---

### 2. **Banner Institucional** (Panel Izquierdo)

**Nombre del archivo:** `bomberos-banner.jpg` o `bomberos-banner.png`

**Ubicación completa:**
```
C:\Users\Rafael\Proyecto_bomberos\font-end\bomberos\public\images\bomberos-banner.jpg
```

**Especificaciones:**
- ✅ Formato: JPG o PNG
- ✅ Tamaño recomendado: 800x400 px (horizontal)
- ✅ Resolución: Mínimo 72-150 DPI
- ✅ Peso: Menos de 1 MB

**Dónde se muestra:**
- En la parte superior del panel izquierdo del login
- Se recorta automáticamente para ajustarse al espacio

---

## 🎨 Recomendaciones de Diseño

### Para el Logo (logo-bomberos.png):
- Debe ser el escudo oficial de Bomberos Voluntarios de Guatemala
- Preferiblemente sin texto alrededor (solo el escudo)
- Fondo transparente para mejor integración
- Buena calidad y nitidez

### Para el Banner (bomberos-banner.jpg):
- Puede incluir:
  - Personal de bomberos en acción
  - Vehículos institucionales
  - Logo institucional grande
  - Foto de la estación central
  - Equipo de trabajo
- Debe tener buena iluminación
- Colores que combinen con rojo/azul/dorado

---

## 📥 Cómo Colocar las Imágenes

### Opción 1: Mediante Explorador de Windows

1. Abre el Explorador de Windows
2. Navega a: `C:\Users\Rafael\Proyecto_bomberos\font-end\bomberos\public\images\`
3. Copia tus imágenes a esta carpeta
4. Asegúrate que los nombres sean EXACTAMENTE:
   - `logo-bomberos.png`
   - `bomberos-banner.jpg` (o `.png`)

### Opción 2: Mediante Git Bash

```bash
cd /c/Users/Rafael/Proyecto_bomberos/font-end/bomberos/public/images/
# Copia tus archivos aquí
cp "C:/ruta/a/tu/imagen.png" logo-bomberos.png
cp "C:/ruta/a/tu/banner.jpg" bomberos-banner.jpg
```

---

## ✅ Verificación

Después de colocar las imágenes:

1. **Reinicia el servidor** (si está corriendo):
   ```bash
   # Detén el servidor (Ctrl + C)
   # Luego reinicia:
   npm run dev
   ```

2. **Abre el navegador** en: `http://localhost:4028`

3. **Verifica que se vean:**
   - Logo en el centro (debe rotar 360° al pasar el mouse)
   - Banner en el panel izquierdo (arriba)
   - Logo pequeño en el header del panel izquierdo

---

## 🔄 Fallback (Respaldo)

Si las imágenes NO se encuentran, el sistema mostrará automáticamente:
- **Logo 360°**: Cruz de Malta con número 123 (SVG generado)
- **Header**: Ícono de llama dorada

**Esto NO es un error**, es el diseño de respaldo.

---

## 🎯 Ejemplo de Estructura Final

```
font-end/bomberos/
├── public/
│   ├── images/
│   │   ├── logo-bomberos.png          ⭐ TU LOGO AQUÍ
│   │   └── bomberos-banner.jpg        ⭐ TU BANNER AQUÍ
│   ├── favicon.ico
│   ├── index.html
│   └── ...
└── src/
    └── ...
```

---

## 🆘 Solución de Problemas

### ❌ Las imágenes no aparecen

**Posibles causas:**

1. **Nombre incorrecto:**
   - ✅ Debe ser EXACTAMENTE: `logo-bomberos.png` y `bomberos-banner.jpg`
   - ❌ NO: `Logo-Bomberos.PNG`, `logo_bomberos.png`, etc.

2. **Ubicación incorrecta:**
   - ✅ Debe estar en: `public/images/`
   - ❌ NO en: `src/images/` o `src/assets/`

3. **Servidor no reiniciado:**
   - Detén el servidor (Ctrl + C)
   - Reinicia: `npm run dev`

4. **Caché del navegador:**
   - Presiona `Ctrl + Shift + R` (recarga forzada)
   - O abre en modo incógnito

5. **Formato de imagen corrupto:**
   - Verifica que la imagen se pueda abrir normalmente
   - Intenta guardarla nuevamente desde un editor de imágenes

---

## 📞 Contacto

Si tienes problemas, verifica:
1. Que las imágenes estén en la carpeta correcta
2. Que los nombres sean exactos (incluyendo la extensión)
3. Que el servidor esté corriendo
4. Que hayas recargado la página

**¡Listo! Tus imágenes institucionales ahora aparecerán en el login.**
