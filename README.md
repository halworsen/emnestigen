# Emnestigen
Grafer for emneavhengigheter på NTNU

![](demo.gif)

![](https://i.imgur.com/vTjHD4g.png)

## Om Emnestigen
Noensinne hatt lyst til å ta et kult emne, men blitt fortapt i en spiral av anbefalte forkunnskaper? Emnestigen er løsningen! Emnestigen lager grafer som viser emneavhengigheter mellom ulike emner. Da kan man enkelt kan finne en god plan for hvilke emner man bør ta for eventuelt å ta et gitt emne.

Emnestigen bruker også en webscraper som for det meste er uavhengig av selve graftegningen, og kan derfor brukes til å bygge datasett om emner ved NTNU.

## Interessante ting å se etter
Siden emnestigen representerer emneavhengigheter som grafer, kan vi enkelt se informasjon om hvor "slitsomt" det er å nå frem til et emne ved å se hvor mange kanter det er fra emnet. Vi kan til og med om det finnes "catch 22"-er for noen emner ved å sjekke om det finnes sykler i emneavhengighetsgrafen. Grafen nedenfor viser emneavhengighetene til emnet MA8202 (Kommutativ algebra)

![](https://i.imgur.com/vTjHD4g.png)

Her kan vi blant annet se at emnet TMA4190 (Introduksjon til topologi) er et svært "slitsomt" emne å sikte på siden det krever  mange forkunnskaper (10 emner, for å være presis). Dessuten kan vi se at vi har noen sykler i grafen! Spesielt denne frekkasen stikker ut:

![](https://i.imgur.com/Qu5yeQC.png)

Man bør altså ha tatt MA3204 for å ta MA3403, men for å ta MA3403 bør man ha tatt MA3204. Sjekker man emnesidene viser det seg å gå greit siden anbefalingen er å ta emnene samtidig, men det finnes flere sykler...

![](https://i.imgur.com/RbmYGLt.png)

... og denne er kanskje litt verre. Grafen viser at for å ta MA3204 bør man, et godt stykke tidligere i studiet, ha tatt TMA4190, men TMA4190 anbefaler MA3204 som en forkunnskap! Titter man nøyere kan man også se at det er sykler i avhengighetsgrafen til TMA4190. Det skal tydeligvis ikke være lett å opparbeide seg forkunnskapene til MA8202, altså!
