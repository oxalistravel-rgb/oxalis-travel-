const fs = require('fs');
const files = fs.readdirSync('assets/');
const jsFile = files.find(f => f.startsWith('index-') && f.endsWith('.js'));
if (jsFile) {
    const path = `assets/${jsFile}`;
    let content = fs.readFileSync(path, 'utf8');

    const startStr = 'm.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-4",children:[';
    const endStr = 'm.jsxs("div",{className:"flex gap-3 mt-6",children:[';

    const startIndex = content.indexOf(startStr);
    const endIndex = content.indexOf(endStr, startIndex);

    if (startIndex !== -1 && endIndex !== -1) {
        const replacement = startStr +
        'm.jsxs("div",{className:"md:col-span-2",children:[m.jsx("label",{className:"text-sm font-medium mb-1 block",children:"Titre du programme / Destination *"}),m.jsx(ut,{dir:"auto",placeholder:"Ex: Voyage de rêve à Skikda...",value:b.destination,onChange:R=>T({...b,destination:R.target.value})})]}),' +
        'm.jsxs("div",{className:"md:col-span-2",children:[m.jsx("label",{className:"text-sm font-medium mb-1 block",children:"Lien de l\'affiche / flyer (Optionnel)"}),m.jsx(ut,{dir:"auto",placeholder:"Ex: /assets/image.png",value:b.image,onChange:R=>T({...b,image:R.target.value})})]}),' +
        'm.jsxs("div",{className:"md:col-span-2",children:[m.jsx("label",{className:"text-sm font-medium mb-1 block",children:"Contenu du programme (Texte complet) *"}),m.jsx(Zi,{dir:"auto",placeholder:"Collez ici TOUT le texte de votre programme (Dates, Prix, Description, Ce qui est inclus, etc.)...",value:b.description,onChange:R=>T({...b,description:R.target.value, subtitle:"", duree:"", prix:"", dates:"", tags:"", programme:"", inclus:""}),rows:15})]})]})],';

        const oldSection = content.substring(startIndex, endIndex);
        if(oldSection.includes('b.destination')) {
             content = content.replace(oldSection, replacement);
             fs.writeFileSync(path, content);
             console.log("Patched successfully!");
        } else {
             console.log("Error: Target section doesn't seem to be the program form.");
        }
    } else {
        console.log("Could not find boundaries");
    }
}
