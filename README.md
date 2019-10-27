# emnestigen
Grafer for emneavhengigheter på NTNU

## Om
Noensinne hatt lyst til å ta et kult emne, men blitt fortapt i en spiral av anbefalte forkunnskaper? Emnestigen er løsningen! Emnestigen kan lage grafer som viser hvilke emner som avhenger av hverandre (enten obligatoriske eller anbefalte). Da kan man enkelt kan finne en god plan for hvilke emner man bør ta for eventuelt å ta et gitt emne.

Emnestigen bruker også en webscraper som for det meste er uavhengig av selve graftegningen, og kan derfor brukes til å bygge datasett om emner ved NTNU.

## Eksempler
![](https://i.imgur.com/62n94pn.png)
Grafen ovenfor er generert med utgangspunkt i emnet TMA4285 Tidsrekker, og viser at emnene TMA4265, TMA4267 og TMA4145 er nevnt som anbefalte forkunnskaper for emnet. Merk at f.eks. TDT4110/4105 (ITGK) ligger øverst i grafen, og ligger derfor til grunn for (potensielt) mange andre emner som bør tas før TMA4285. Det samme gjelder MA1101 og MA1201. Vi kan også se at MA1201 ser ut som et solid emnevalg siden det oppfyller forkunnskapskravene til 3 andre fag.

![](https://i.imgur.com/NG7l5lG.png)
For TMA4295 er TMA4267 og TMA4255 nevnt som anbefalte forkunnskaper. Det er lett å se at TMA4240 er verdt å jobbe mot, siden det er anbefalt forkunnskap for TMA4295 direkte, samt for de to andre anbefalte fagene for TMA4295.

## Ting å være obs på
Hvis man graver litt på selve emnesidene kan man merke at selv om det (ser ut som det) er en kant mellom TMA4100 og MA0001 i grafen til TMA4295, så er ikke MA0001 en anbefalt forkunnskap for TMA4100. Dette kommer av at ST0103 avhenger av MA0001, og grafen uheldigvis er tegnet på en slik måte at kanten mellom ST0103 og MA0001 går direkte gjennom TMA4100. Vær derfor obs på at det kan se ut som det er kanter/avhengigheter mellom fag der det egentlig ikke er noen.

Sluttmålet for emnestigen er interaktive grafer (dvs. du kan bl.a. flytte på nodene) så forhåpentligvis løser dette seg etter hvert, men ta grafene med en klype salt og dobbeltsjekk på emnesidene inntil den tid :)
