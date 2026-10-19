Ubacite fotografije ovde (jpg, png ili webp). Ime fajla određuje gde se prikazuje:

- hero.jpg      – velika slika na početku
- about.jpg     – odeljak "O nama"
- food.jpg      – kartica "Dostava hrane"
- market.jpg    – kartica "Dostava pića i namirnica"
- flowers.jpg   – kartica "Cveće"
- map.jpg       – (trenutno se ne koristi)

Dok slike ne postoje, prikazuje se siva zamena sa opisom.

Za stranicu "Naruči":

- kategorije/<key>.jpg – slika kategorije (key iz src/catalog.js: burger, pica, palacinke, cokoladne, dvesprata...)
- lokali/<slug>.jpg    – naslovna slika lokala (picerija-kastelo, kafanica, life-picerija, pastizza, la-moara...)

Dok ih nema, prikazuje se emoji na obojenoj pozadini. Najbolje kvadratne slike (kategorije) i široke (lokali).
