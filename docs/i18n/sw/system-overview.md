# Nyaraka za mfumo — Kiswahili

## Sehemu A — Maelezo ya kiufundi

### Lengo na mipaka
Nexus Contextual Knowledge Graph Engine ni mazingira yanayotengenezwa yanayotumia grafu kuwakilisha vitu na uhusiano wake, kuhifadhi muktadha wa vyanzo na ushahidi, kuthibitisha data ya grafu inayoingizwa, na kuunganisha maeneo makubwa ya maarifa kupitia vizalia vya kiwango cha juu. Kwa sasa hazina ya mradi ina programu ya HTML/React iliyo katika faili moja, moduli za uthibitishaji za JavaScript, mifano ya JSON, skima, majaribio na otomatiki ya GitHub Actions.

### Tabaka kuu
1. **Grafu ya msingi:** nodi na kingo huwakilisha vitu na mahusiano. Vitambulisho na sifa zinapaswa kuhifadhiwa wakati wa uingizaji/utoaji unaoungwa mkono.
2. **Uthibitishaji na ubadilishanaji data:** ukaguzi wa muundo, urejeshaji wa hali iliyohifadhiwa, njia za kuingiza data na majaribio ya miundo tofauti. CSV inasaidia sehemu zilizo ndani ya alama za kunukuu, alama za kunukuu zilizotoroshwa, na mistari mipya ndani ya sehemu. Kileta data cha Cypher hushughulikia sehemu ndogo tu inayotegemea regex; si kichanganuzi kamili cha Cypher.
3. **Mkusanyiko wa marejeo na ushahidi:** rekodi tofauti za vyanzo/kazi, waandishi/wachapishaji, madai na viungo vya ushahidi. Ushahidi unaweza kulenga nodi, ukingo, dai au njia yenye mwelekeo ya nodi–ukingo–nodi. Chanzo, dai, msimamo wa ushahidi, uaminifu wa chanzo na uhakika wa uchimbuaji ni dhana tofauti.
4. **Tabaka la vizalia vya mtandao vya kiwango cha juu:** vizalia vyenye matoleo huunganisha marejeo yenye aina maalum kwa nodi, kingo, madai, vyanzo, viungo vya ushahidi, miktadha na vizalia vingine. Viungo vinaweza kuonyesha mahusiano kama kina, kinaingiliana, kinaweka muktadha, kinapingana au kinategemea. Neno “neural” kwa sasa linaeleza dhana ya uundaji wa mtandao wa kiwango cha juu; mtandao wa neva uliofunzwa bado haujatekelezwa.
5. **Majaribio na otomatiki:** majaribio ya Node.js na GitHub Actions hukagua mikataba ya data na mifano inayoungwa mkono.

### Asili ya data na kutokuwa na uhakika
Utambulisho wa kitu cha msingi lazima utenganishwe na uanachama wake katika kizio cha vizalia. Pale inapofaa, hifadhi asili, toleo, njia ya uundaji, picha za data ya ingizo, mipaka ya muda/muktadha na marejeo ya ushahidi. Ufanano, umuhimu, uzito wa ukingo, uhakika, uaminifu wa chanzo, msimamo wa ushahidi na ukweli havipaswi kuunganishwa kuwa alama moja. Data ya majaribio iliyobuniwa si chanzo halisi.

### Hali ya utekelezaji
Tawi la kazi lina uthibitishaji na majaribio ya grafu, hifadhi ya msingi na mifano ya uingizaji, skima na mifano ya mkusanyiko wa marejeo/ushahidi, pamoja na usanifu, skima, mifano na majaribio ya uadilifu ya tabaka la vizalia. Kihariri cha marejeo cha kuona, kichunguzi cha vizalia, uingizaji mpana wa vyanzo na uchanganuzi halisi wa mtandao wa neva/embedding bado ni kazi za baadaye. Kagua hali ya GitHub Actions kabla ya kusema kuwa toleo la mwisho limefaulu majaribio.

## Sehemu B — Mwongozo wa lugha rahisi

Nexus ni mradi wa kupanga taarifa katika vipande vinavyounganishwa. Nodi huwakilisha kitu au wazo; ukingo huonyesha uhusiano kati ya vipande viwili. Vyanzo na ushahidi husaidia kueleza taarifa imetoka wapi. Makundi makubwa ya vipande vinavyohusiana huitwa vizalia.

Kwa mfano, kizio kimoja cha vizalia kinaweza kuweka pamoja ripoti, mada, uhusiano wake na vyanzo vinavyojadili uhusiano huo. Vizalia vinaweza pia kuunganishwa na vizalia vingine. Hii husaidia kuchunguza taarifa nyingi bila kunakili ukweli uleule mara nyingi.

Mfumo bado unatengenezwa. Baadhi ya ukaguzi wa data, mifano, skima na majaribio ya kiotomatiki tayari yapo. Kihariri kamili cha kuona, ugunduzi wa makundi kiotomatiki na uchanganuzi wa mtandao halisi wa neva bado havijakamilika. Mifano iliyoandikwa kuwa ya kubuni ni ya maonyesho tu, si uthibitisho wa ukweli wa dunia halisi.

Kwa kila taarifa, tenga maswali matatu: rekodi inasema nini, ni chanzo gani kinachoiunga mkono, na tuna uhakika kiasi gani kuhusu tafsiri yake? Tofauti za maoni na kutokuwa na uhakika vinapaswa kuonekana.

## Hatua mpya ya kupakia mkusanyiko wa data

Kipakiaji husoma grafu, vyanzo, madai, viungo vya ushahidi, vizalia na viungo kati ya vizalia kwa pamoja, kisha hukagua marejeo na kuunda faharasa za kutafuta. Faili zinazokosekana na marejeo yaliyovunjika huripotiwa badala ya kukubaliwa kimyakimya. Hii ni kazi ya kupakia data na kukagua ulinganifu wake, si mtandao wa neva unaojifunza au kuthibitisha ukweli.

Kwa lugha rahisi, mfumo sasa una njia inayoweza kutumiwa tena kukusanya rekodi zilizounganishwa na kuangalia kama viungo vyake vinaelekeza kwenye rekodi zilizopo kabla sehemu nyingine ya programu haijazitumia. Kipakiaji bado hakijaunganishwa na kiolesura cha kivinjari.
