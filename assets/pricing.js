// Luderbein – pricing.js v1.1
window.LUDERBEIN_PRICING={
 meta:{
   currency:"EUR",
   updated:"2026-01-02",
   note:"Kleinunternehmer gem. §19 UStG – keine MwSt."
 },
 shipping:{
   enabled:true,basePrice:6.95,minOrderForShipping:29.95,
   freeShippingFrom:80.00,label:"Versand (wenn gewünscht)"
 },
 products:{
   schiefer:{
     label:"Schiefer",includes:"inkl. Fotoaufbereitung, Gravur & Klarlack",
     variants:{
       fotogravur:{
         label:"Fotogravur",
         formats:[
           {id:"10x10",label:"10×10 cm",price:14.95},
           {id:"20x20",label:"20×20 cm",price:19.95},
           {id:"25x25",label:"25×25 cm",price:39.95},
           {id:"38x13",label:"38×13 cm",price:34.95},
           {id:"45x30",label:"45×30 cm",price:89.95}
         ]
       },
       gedenktafel:{
         label:"Gedenktafel",
         formats:[{id:"10x10",label:"10×10 cm",price:19.95}]
       }
     },
     upgrades:{
       widmung:{label:"Signatur/Widmung",price:4.95},
       standfuss:{label:"Standfuß (3D-Druck)",price:9.95},
       wandhalter:{label:"Wandhalterung",price:6.95},
       express:{label:"Express (3 WT)",price:19.95}
     }
   }
 }
};
