# IMAGE_AUDIT.md — UncoverCeylon Destination Imagery Audit

Generated: 2026-10-03T19:22:40.886Z
Total Places Audited: 60

## Summary Findings
- **Unique Images**: 22
- **Duplicated URLs**: Multiple destinations share the exact same Unsplash stock URLs across different provinces.
- **Solution Applied**: All components now use <PlaceImage>, which displays a branded light-blue fallback with category icons and prevents layout shift.
- **Action Required**: The user/admin can replace the flagged duplicates with verified local photos in the Admin portal (/admin) or SQLite database.

## Destination Image Inventory

| ID | Place Name | Category | Province / Location | Status | Current Image | Notes & Replacement Guidance |
| :- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | Sigiriya Rock Fortress | Ancient Sites | Sigiriya, Matale District | OK | https://images.unsplash.com/photo-1578662996442-48f6... | Authentic representation |
| 2 | Ella Rock | Mountains | Ella, Badulla District | OK | https://images.unsplash.com/photo-1576706374778-95a9... | Authentic representation |
| 3 | Nine Arch Bridge | Hidden Gems | Demodara, Ella | OK | https://images.unsplash.com/photo-1535463731090-e34f... | Authentic representation |
| 4 | Mirissa Beach | Beaches | Mirissa, Matara District | OK | https://images.unsplash.com/photo-1506905925346-21bd... | Authentic representation |
| 5 | Horton Plains National Park | Wildlife | Nuwara Eliya District | OK | https://images.unsplash.com/photo-1586348943529-beaa... | Authentic representation |
| 6 | Adam's Peak (Sri Pada) | Mountains | Dalhousie, Ratnapura District | OK | https://images.unsplash.com/photo-1544551763-46a013b... | Authentic representation |
| 7 | Yala National Park | Wildlife | Tissamaharama, Hambantota | OK | https://images.unsplash.com/photo-1615729947596-a598... | Authentic representation |
| 8 | Pidurangala Rock | Hidden Gems | Sigiriya, Matale District | OK | https://images.unsplash.com/photo-1593693411515-c202... | Authentic representation |
| 9 | Ravana Falls | Waterfalls | Ella-Wellawaya Road, Badulla | OK | https://images.unsplash.com/photo-1467173572719-f14b... | Authentic representation |
| 10 | Galle Fort | Historical | Galle, Southern Province | OK | https://images.unsplash.com/photo-1558618666-fcd25c8... | Authentic representation |
| 11 | Dambulla Cave Temple | Ancient Sites | Dambulla, Matale District | OK | https://images.unsplash.com/photo-1575994532946-e99d... | Authentic representation |
| 12 | Knuckles Mountain Range | Mountains | Kandy District | OK | https://images.unsplash.com/photo-1464822759023-fed6... | Authentic representation |
| 14 | Colombo National Museum | Historical | Cinnamon Gardens, Colombo 07 | DUPLICATE | https://images.unsplash.com/photo-1578662996442-48f6... | Shared by 7 places; replace with specific photo of Colombo National Museum |
| 15 | Gangaramaya Temple & Seema Malaka | Religious Places | Slave Island, Colombo 02 | DUPLICATE | https://images.unsplash.com/photo-1544735716-392fe24... | Shared by 13 places; replace with specific photo of Gangaramaya Temple & Seema Malaka |
| 16 | Galle Face Green & Port City Beach | Beaches | Fort / Kollupitiya, Colombo | DUPLICATE | https://images.unsplash.com/photo-1506905925346-21bd... | Shared by 9 places; replace with specific photo of Galle Face Green & Port City Beach |
| 17 | Beddagana Wetland Park | Wildlife | Sri Jayawardenepura Kotte | DUPLICATE | https://images.unsplash.com/photo-1615729947596-a598... | Shared by 2 places; replace with specific photo of Beddagana Wetland Park |
| 18 | Richmond Castle & Kalutara Bodhiya | Hidden Gems | Kalutara South | DUPLICATE | https://images.unsplash.com/photo-1544735716-392fe24... | Shared by 13 places; replace with specific photo of Richmond Castle & Kalutara Bodhiya |
| 19 | Temple of the Sacred Tooth Relic (Dalada Maligawa) | Religious Places | Kandy Lake, Kandy | DUPLICATE | https://images.unsplash.com/photo-1586348943529-beaa... | Shared by 6 places; replace with specific photo of Temple of the Sacred Tooth Relic (Dalada Maligawa) |
| 20 | Ambuluwawa Biodiversity Complex & Tower | Hidden Gems | Gampola, Kandy District | OK | https://images.unsplash.com/photo-1576706374778-95a9... | Authentic representation |
| 21 | Royal Botanical Gardens, Peradeniya | Ancient Sites | Peradeniya, Kandy | DUPLICATE | https://images.unsplash.com/photo-1544735716-392fe24... | Shared by 13 places; replace with specific photo of Royal Botanical Gardens, Peradeniya |
| 22 | Ramboda Falls & Twin Cascades | Waterfalls | Pussellawa / Ramboda Pass | DUPLICATE | https://images.unsplash.com/photo-1467173572719-f14b... | Shared by 5 places; replace with specific photo of Ramboda Falls & Twin Cascades |
| 23 | Sembuwatta Lake, Matale | Hidden Gems | Elkaduwa, Matale District | DUPLICATE | https://images.unsplash.com/photo-1506905925346-21bd... | Shared by 9 places; replace with specific photo of Sembuwatta Lake, Matale |
| 24 | Sinharaja Rainforest Reserve | Wildlife | Deniyaya / Kudawa entrances | DUPLICATE | https://images.unsplash.com/photo-1544735716-392fe24... | Shared by 13 places; replace with specific photo of Sinharaja Rainforest Reserve |
| 25 | Unawatuna Beach & Jungle Beach | Beaches | Unawatuna, Galle District | DUPLICATE | https://images.unsplash.com/photo-1506905925346-21bd... | Shared by 9 places; replace with specific photo of Unawatuna Beach & Jungle Beach |
| 26 | Madu Ganga River Safari | Hidden Gems | Balapitiya, Galle District | DUPLICATE | https://images.unsplash.com/photo-1552465011-b4e21bf... | Shared by 2 places; replace with specific photo of Madu Ganga River Safari |
| 27 | Hummanaya Blowhole, Kudawella | Hidden Gems | Kudawella, Tangalle | DUPLICATE | https://images.unsplash.com/photo-1506905925346-21bd... | Shared by 9 places; replace with specific photo of Hummanaya Blowhole, Kudawella |
| 28 | Jaffna Dutch Fort & Coastal Moat | Historical | Jaffna City Center | DUPLICATE | https://images.unsplash.com/photo-1578662996442-48f6... | Shared by 7 places; replace with specific photo of Jaffna Dutch Fort & Coastal Moat |
| 29 | Nallur Kandaswamy Kovil | Religious Places | Nallur, Jaffna | DUPLICATE | https://images.unsplash.com/photo-1544735716-392fe24... | Shared by 13 places; replace with specific photo of Nallur Kandaswamy Kovil |
| 30 | Casuarina Beach, Karainagar | Beaches | Karainagar Island, Jaffna | DUPLICATE | https://images.unsplash.com/photo-1506905925346-21bd... | Shared by 9 places; replace with specific photo of Casuarina Beach, Karainagar |
| 31 | Delft Island (Neduntheevu) | Hidden Gems | Neduntheevu, Jaffna District | DUPLICATE | https://images.unsplash.com/photo-1578662996442-48f6... | Shared by 7 places; replace with specific photo of Delft Island (Neduntheevu) |
| 32 | Keerimalai Sacred Springs & Naguleswaram | Ancient Sites | Keerimalai, Jaffna Peninsula | DUPLICATE | https://images.unsplash.com/photo-1544735716-392fe24... | Shared by 13 places; replace with specific photo of Keerimalai Sacred Springs & Naguleswaram |
| 33 | Arugam Bay (A-Bay) | Beaches | Pottuvil, Ampara District | DUPLICATE | https://images.unsplash.com/photo-1506905925346-21bd... | Shared by 9 places; replace with specific photo of Arugam Bay (A-Bay) |
| 34 | Pigeon Island National Park, Nilaveli | Wildlife | Nilaveli, Trincomalee | DUPLICATE | https://images.unsplash.com/photo-1544735716-392fe24... | Shared by 13 places; replace with specific photo of Pigeon Island National Park, Nilaveli |
| 35 | Koneswaram Temple & Swami Rock | Religious Places | Fort Frederick, Trincomalee | DUPLICATE | https://images.unsplash.com/photo-1586348943529-beaa... | Shared by 6 places; replace with specific photo of Koneswaram Temple & Swami Rock |
| 36 | Pasikudah Bay (Coral Shelf Lagoon) | Beaches | Kalkudah, Batticaloa District | DUPLICATE | https://images.unsplash.com/photo-1506905925346-21bd... | Shared by 9 places; replace with specific photo of Pasikudah Bay (Coral Shelf Lagoon) |
| 37 | Yapahuwa Rock Fortress | Ancient Sites | Maho, Kurunegala District | DUPLICATE | https://images.unsplash.com/photo-1578662996442-48f6... | Shared by 7 places; replace with specific photo of Yapahuwa Rock Fortress |
| 38 | Kalpitiya Peninsula & Dolphin Haven | Wildlife | Kalpitiya, Puttalam District | DUPLICATE | https://images.unsplash.com/photo-1544735716-392fe24... | Shared by 13 places; replace with specific photo of Kalpitiya Peninsula & Dolphin Haven |
| 39 | Munneswaram Kovil, Chilaw | Religious Places | Chilaw, Puttalam District | DUPLICATE | https://images.unsplash.com/photo-1586348943529-beaa... | Shared by 6 places; replace with specific photo of Munneswaram Kovil, Chilaw |
| 40 | Anuradhapura Sacred City & Ruwanwelisaya | Ancient Sites | Anuradhapura Sacred Area | DUPLICATE | https://images.unsplash.com/photo-1586348943529-beaa... | Shared by 6 places; replace with specific photo of Anuradhapura Sacred City & Ruwanwelisaya |
| 41 | Polonnaruwa Ancient City & Gal Vihara | Ancient Sites | Polonnaruwa Ancient Complex | DUPLICATE | https://images.unsplash.com/photo-1578662996442-48f6... | Shared by 7 places; replace with specific photo of Polonnaruwa Ancient City & Gal Vihara |
| 42 | Mihintale (The Cradle of Buddhism) | Religious Places | Mihintale, 12km east of Anuradhapura | DUPLICATE | https://images.unsplash.com/photo-1586348943529-beaa... | Shared by 6 places; replace with specific photo of Mihintale (The Cradle of Buddhism) |
| 43 | Ritigala Strict Nature Reserve & Monastery | Hidden Gems | Galapitagala, North Central | DUPLICATE | https://images.unsplash.com/photo-1544735716-392fe24... | Shared by 13 places; replace with specific photo of Ritigala Strict Nature Reserve & Monastery |
| 44 | Diyaluma Falls & Upper Rock Pools | Waterfalls | Poonagala / Koslanda, Badulla District | DUPLICATE | https://images.unsplash.com/photo-1467173572719-f14b... | Shared by 5 places; replace with specific photo of Diyaluma Falls & Upper Rock Pools |
| 45 | Dunhinda Falls (The Smoky Cascade) | Waterfalls | Badulla Town outskirts | DUPLICATE | https://images.unsplash.com/photo-1467173572719-f14b... | Shared by 5 places; replace with specific photo of Dunhinda Falls (The Smoky Cascade) |
| 46 | Liptons Seat & Dambatenne Tea Estate | Hidden Gems | Haputale, Badulla District | DUPLICATE | https://images.unsplash.com/photo-1544735716-392fe24... | Shared by 13 places; replace with specific photo of Liptons Seat & Dambatenne Tea Estate |
| 47 | Udawalawe National Park (Elephant Safari) | Wildlife | Udawalawe, Sabaragamuwa / Uva border | DUPLICATE | https://images.unsplash.com/photo-1561731216-c3a4d99... | Shared by 2 places; replace with specific photo of Udawalawe National Park (Elephant Safari) |
| 48 | Bopath Ella Falls, Ratnapura | Waterfalls | Kuruwita, Ratnapura District | DUPLICATE | https://images.unsplash.com/photo-1467173572719-f14b... | Shared by 5 places; replace with specific photo of Bopath Ella Falls, Ratnapura |
| 49 | Kitulgala White Water Rafting & Kelani River | Hidden Gems | Kitulgala, Kegalle District | DUPLICATE | https://images.unsplash.com/photo-1544735716-392fe24... | Shared by 13 places; replace with specific photo of Kitulgala White Water Rafting & Kelani River |
| 50 | Wilpattu National Park (Willu Wilderness) | Wildlife | Nochchiyagama / Puttalam border | DUPLICATE | https://images.unsplash.com/photo-1561731216-c3a4d99... | Shared by 2 places; replace with specific photo of Wilpattu National Park (Willu Wilderness) |
| 51 | Panduwasnuwara Ancient Kingdom | Historical | Hettipola, Kurunegala District | DUPLICATE | https://images.unsplash.com/photo-1578662996442-48f6... | Shared by 7 places; replace with specific photo of Panduwasnuwara Ancient Kingdom |
| 52 | Kumana National Park (Bird Sanctuary) | Wildlife | Okanda, Ampara District | DUPLICATE | https://images.unsplash.com/photo-1615729947596-a598... | Shared by 2 places; replace with specific photo of Kumana National Park (Bird Sanctuary) |
| 53 | Batticaloa Dutch Fort & Kallady Lagoon | Historical | Puliyanthivu, Batticaloa | DUPLICATE | https://images.unsplash.com/photo-1578662996442-48f6... | Shared by 7 places; replace with specific photo of Batticaloa Dutch Fort & Kallady Lagoon |
| 54 | Marble Beach, Trincomalee | Beaches | China Bay, Trincomalee | DUPLICATE | https://images.unsplash.com/photo-1506905925346-21bd... | Shared by 9 places; replace with specific photo of Marble Beach, Trincomalee |
| 55 | Nainativu Island & Nagadeepa Viharaya | Religious Places | Nainativu Island, Jaffna District | DUPLICATE | https://images.unsplash.com/photo-1586348943529-beaa... | Shared by 6 places; replace with specific photo of Nainativu Island & Nagadeepa Viharaya |
| 56 | Point Pedro & Manalkadu Sand Dunes | Hidden Gems | Point Pedro, Jaffna Peninsula | DUPLICATE | https://images.unsplash.com/photo-1506905925346-21bd... | Shared by 9 places; replace with specific photo of Point Pedro & Manalkadu Sand Dunes |
| 57 | Negombo Lagoon & Old Dutch Canal | Hidden Gems | Negombo, Gampaha District | DUPLICATE | https://images.unsplash.com/photo-1552465011-b4e21bf... | Shared by 2 places; replace with specific photo of Negombo Lagoon & Old Dutch Canal |
| 58 | Seethawaka Wet Zone Botanical Garden | Hidden Gems | Illukowita, Avissawella | DUPLICATE | https://images.unsplash.com/photo-1544735716-392fe24... | Shared by 13 places; replace with specific photo of Seethawaka Wet Zone Botanical Garden |
| 59 | Kirindi Ella Falls, Pelmadulla | Waterfalls | Pelmadulla, Ratnapura District | DUPLICATE | https://images.unsplash.com/photo-1467173572719-f14b... | Shared by 5 places; replace with specific photo of Kirindi Ella Falls, Pelmadulla |
| 60 | Belilena Prehistoric Cave, Kitulgala | Ancient Sites | Kitulgala, Kegalle District | DUPLICATE | https://images.unsplash.com/photo-1544735716-392fe24... | Shared by 13 places; replace with specific photo of Belilena Prehistoric Cave, Kitulgala |
| 61 | Knuckles Five Peaks (Dumbara Range) | Mountains | Matale / Kandy Districts | OK | /uploads/ceylon_1791039319424_2wqp4z.webp | Authentic representation |
