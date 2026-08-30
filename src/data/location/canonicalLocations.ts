// ==============================================================================
// TheVrindaGroup - Canonical India State & District Reference Dataset (V1)
// Source: Official Government of India Administrative Hierarchy (LGD / Survey of India)
// 28 States + 8 Union Territories (36 Total) & All Official Districts
// ==============================================================================

export type LocationType = "STATE" | "DISTRICT";

export interface CanonicalState {
  name: string;
  type: "STATE" | "UT";
  districts: string[];
}

export interface LocationSearchResult {
  state: string;
  district: string | null;
  type: LocationType;
  label: string;
}

export const CANONICAL_STATES_DATA: CanonicalState[] = [
  {
    name: "Andhra Pradesh",
    type: "STATE",
    districts: [
      "Alluri Sitharama Raju",
      "Anakapalli",
      "Ananthapuramu",
      "Annamayya",
      "Bapatla",
      "Chittoor",
      "Dr. B.R. Ambedkar Konaseema",
      "East Godavari",
      "Eluru",
      "Guntur",
      "Kakinada",
      "Krishna",
      "Kurnool",
      "Nandyal",
      "NTR",
      "Palnadu",
      "Parvathipuram Manyam",
      "Prakasam",
      "Sri Potti Sriramulu Nellore",
      "Sri Sathya Sai",
      "Srikakulam",
      "Tirupati",
      "Visakhapatnam",
      "Vizianagaram",
      "West Godavari",
      "YSR Kadapa",
    ],
  },
  {
    name: "Arunachal Pradesh",
    type: "STATE",
    districts: [
      "Anjaw",
      "Changlang",
      "Dibang Valley",
      "East Kameng",
      "East Siang",
      "Itanagar Capital Complex",
      "Kamle",
      "Kra Daadi",
      "Kurung Kumey",
      "Lepa Rada",
      "Lohit",
      "Longding",
      "Lower Dibang Valley",
      "Lower Siang",
      "Lower Subansiri",
      "Namsai",
      "Pakke Kessang",
      "Papum Pare",
      "Shi Yomi",
      "Siang",
      "Tawang",
      "Tirap",
      "Upper Siang",
      "Upper Subansiri",
      "West Kameng",
      "West Siang",
    ],
  },
  {
    name: "Assam",
    type: "STATE",
    districts: [
      "Baksa",
      "Barpeta",
      "Biswanath",
      "Bongaigaon",
      "Cachar",
      "Charaideo",
      "Chirang",
      "Darrang",
      "Dhemaji",
      "Dhubri",
      "Dibrugarh",
      "Dima Hasao",
      "Goalpara",
      "Golaghat",
      "Hailakandi",
      "Hojai",
      "Jorhat",
      "Kamrup",
      "Kamrup Metropolitan",
      "Karbi Anglong",
      "Karimganj",
      "Kokrajhar",
      "Lakhimpur",
      "Majuli",
      "Morigaon",
      "Nagaon",
      "Nalbari",
      "Sivasagar",
      "Sonitpur",
      "South Salmara-Mankachar",
      "Tamulpur",
      "Tinsukia",
      "Udalguri",
      "West Karbi Anglong",
    ],
  },
  {
    name: "Bihar",
    type: "STATE",
    districts: [
      "Araria",
      "Arwal",
      "Aurangabad",
      "Banka",
      "Begusarai",
      "Bhagalpur",
      "Bhojpur",
      "Buxar",
      "Darbhanga",
      "East Champaran",
      "Gaya",
      "Gopalganj",
      "Jamui",
      "Jehanabad",
      "Kaimur",
      "Katihar",
      "Khagaria",
      "Kishanganj",
      "Lakhisarai",
      "Madhepura",
      "Madhubani",
      "Munger",
      "Muzaffarpur",
      "Nalanda",
      "Nawada",
      "Patna",
      "Purnia",
      "Rohtas",
      "Saharsa",
      "Samastipur",
      "Saran",
      "Sheikhpura",
      "Sheohar",
      "Sitamarhi",
      "Siwan",
      "Supaul",
      "Vaishali",
      "West Champaran",
    ],
  },
  {
    name: "Chhattisgarh",
    type: "STATE",
    districts: [
      "Balod",
      "Baloda Bazar-Bhatapara",
      "Balrampur-Ramanujganj",
      "Bastar",
      "Bemetara",
      "Bijapur",
      "Bilaspur",
      "Dantewada",
      "Dhamtari",
      "Durg",
      "Gariaband",
      "Gaurela-Pendra-Marwahi",
      "Janjgir-Champa",
      "Jashpur",
      "Kabirdham",
      "Kanker",
      "Khairagarh-Chhuikhadan-Gandai",
      "Kondagaon",
      "Korba",
      "Koriya",
      "Mahasamund",
      "Manendragarh-Chirmiri-Bharatpur",
      "Mohla-Manpur-Ambagarh Chowki",
      "Mungeli",
      "Narayanpur",
      "Raigarh",
      "Raipur",
      "Rajnandgaon",
      "Sakti",
      "Sarangarh-Bilaigarh",
      "Sukma",
      "Surajpur",
      "Surguja",
    ],
  },
  {
    name: "Goa",
    type: "STATE",
    districts: [
      "North Goa",
      "South Goa",
    ],
  },
  {
    name: "Gujarat",
    type: "STATE",
    districts: [
      "Ahmedabad",
      "Amreli",
      "Anand",
      "Aravalli",
      "Banaskantha",
      "Bharuch",
      "Bhavnagar",
      "Botad",
      "Chhota Udaipur",
      "Dahod",
      "Dang",
      "Devbhumi Dwarka",
      "Gandhinagar",
      "Gir Somnath",
      "Jamnagar",
      "Junagadh",
      "Kheda",
      "Kutch",
      "Mahisagar",
      "Mehsana",
      "Morbi",
      "Narmada",
      "Navsari",
      "Panchmahal",
      "Patan",
      "Porbandar",
      "Rajkot",
      "Sabarkantha",
      "Surat",
      "Surendranagar",
      "Tapi",
      "Vadodara",
      "Valsad",
    ],
  },
  {
    name: "Haryana",
    type: "STATE",
    districts: [
      "Ambala",
      "Bhiwani",
      "Charkhi Dadri",
      "Faridabad",
      "Fatehabad",
      "Gurugram",
      "Hisar",
      "Jhajjar",
      "Jind",
      "Kaithal",
      "Karnal",
      "Kurukshetra",
      "Mahendragarh",
      "Nuh",
      "Palwal",
      "Panchkula",
      "Panipat",
      "Rewari",
      "Rohtak",
      "Sirsa",
      "Sonipat",
      "Yamunanagar",
    ],
  },
  {
    name: "Himachal Pradesh",
    type: "STATE",
    districts: [
      "Bilaspur",
      "Chamba",
      "Hamirpur",
      "Kangra",
      "Kinnaur",
      "Kullu",
      "Lahaul and Spiti",
      "Mandi",
      "Shimla",
      "Sirmaur",
      "Solan",
      "Una",
    ],
  },
  {
    name: "Jharkhand",
    type: "STATE",
    districts: [
      "Bokaro",
      "Chatra",
      "Deoghar",
      "Dhanbad",
      "Dumka",
      "East Singhbhum",
      "Garhwa",
      "Giridih",
      "Godda",
      "Gumla",
      "Hazaribagh",
      "Jamtara",
      "Khunti",
      "Koderma",
      "Latehar",
      "Lohardaga",
      "Pakur",
      "Palamu",
      "Ramgarh",
      "Ranchi",
      "Sahebganj",
      "Seraikela Kharsawan",
      "Simdega",
      "West Singhbhum",
    ],
  },
  {
    name: "Karnataka",
    type: "STATE",
    districts: [
      "Bagalkote",
      "Ballari",
      "Belagavi",
      "Bengaluru Rural",
      "Bengaluru Urban",
      "Bidar",
      "Chamarajanagara",
      "Chikkaballapura",
      "Chikkamagaluru",
      "Chitradurga",
      "Dakshina Kannada",
      "Davanagere",
      "Dharwad",
      "Gadag",
      "Hassan",
      "Haveri",
      "Kalaburagi",
      "Kodagu",
      "Kolar",
      "Koppal",
      "Mandya",
      "Mysuru",
      "Raichur",
      "Ramanagara",
      "Shivamogga",
      "Tumakuru",
      "Udupi",
      "Uttara Kannada",
      "Vijayanagara",
      "Vijayapura",
      "Yadgir",
    ],
  },
  {
    name: "Kerala",
    type: "STATE",
    districts: [
      "Alappuzha",
      "Ernakulam",
      "Idukki",
      "Kannur",
      "Kasaragod",
      "Kollam",
      "Kottayam",
      "Kozhikode",
      "Malappuram",
      "Palakkad",
      "Pathanamthitta",
      "Thiruvananthapuram",
      "Thrissur",
      "Wayanad",
    ],
  },
  {
    name: "Madhya Pradesh",
    type: "STATE",
    districts: [
      "Agar Malwa",
      "Alirajpur",
      "Anuppur",
      "Ashoknagar",
      "Balaghat",
      "Barwani",
      "Betul",
      "Bhind",
      "Bhopal",
      "Burhanpur",
      "Chhatarpur",
      "Chhindwara",
      "Damoh",
      "Datia",
      "Dewas",
      "Dhar",
      "Dindori",
      "Guna",
      "Gwalior",
      "Harda",
      "Indore",
      "Jabalpur",
      "Jhabua",
      "Katni",
      "Khandwa",
      "Khargone",
      "Maihar",
      "Mandla",
      "Mandsaur",
      "Mauganj",
      "Morena",
      "Narmadapuram",
      "Narsinghpur",
      "Neemuch",
      "Niwari",
      "Pandhurna",
      "Panna",
      "Raisen",
      "Rajgarh",
      "Ratlam",
      "Rewa",
      "Sagar",
      "Satna",
      "Sehore",
      "Seoni",
      "Shahdol",
      "Shajapur",
      "Sheopur",
      "Shivpuri",
      "Sidhi",
      "Singrauli",
      "Tikamgarh",
      "Ujjain",
      "Umaria",
      "Vidisha",
    ],
  },
  {
    name: "Maharashtra",
    type: "STATE",
    districts: [
      "Ahilyanagar",
      "Akola",
      "Amravati",
      "Beed",
      "Bhandara",
      "Buldhana",
      "Chandrapur",
      "Chhatrapati Sambhajinagar",
      "Dharashiv",
      "Dhule",
      "Gadchiroli",
      "Gondia",
      "Hingoli",
      "Jalgaon",
      "Jalna",
      "Kolhapur",
      "Latur",
      "Mumbai City",
      "Mumbai Suburban",
      "Nagpur",
      "Nanded",
      "Nandurbar",
      "Nashik",
      "Palghar",
      "Parbhani",
      "Pune",
      "Raigad",
      "Ratnagiri",
      "Sangli",
      "Satara",
      "Sindhudurg",
      "Solapur",
      "Thane",
      "Wardha",
      "Washim",
      "Yavatmal",
    ],
  },
  {
    name: "Manipur",
    type: "STATE",
    districts: [
      "Bishnupur",
      "Chandel",
      "Churachandpur",
      "Imphal East",
      "Imphal West",
      "Jiribam",
      "Kakching",
      "Kamjong",
      "Kangpokpi",
      "Noney",
      "Pherzawl",
      "Senapati",
      "Tamenglong",
      "Tengnoupal",
      "Thoubal",
      "Ukhrul",
    ],
  },
  {
    name: "Meghalaya",
    type: "STATE",
    districts: [
      "East Garo Hills",
      "East Jaintia Hills",
      "East Khasi Hills",
      "Eastern West Khasi Hills",
      "North Garo Hills",
      "Ri Bhoi",
      "South Garo Hills",
      "South West Garo Hills",
      "South West Khasi Hills",
      "West Garo Hills",
      "West Jaintia Hills",
      "West Khasi Hills",
    ],
  },
  {
    name: "Mizoram",
    type: "STATE",
    districts: [
      "Aizawl",
      "Champhai",
      "Hnahthial",
      "Khawzawl",
      "Kolasib",
      "Lawngtlai",
      "Lunglei",
      "Mamit",
      "Saitual",
      "Serchhip",
      "Siaha",
    ],
  },
  {
    name: "Nagaland",
    type: "STATE",
    districts: [
      "Chümoukedima",
      "Dimapur",
      "Kiphire",
      "Kohima",
      "Longleng",
      "Mokokchung",
      "Mon",
      "Niuland",
      "Noklak",
      "Peren",
      "Phek",
      "Shamator",
      "Tseminyü",
      "Tuensang",
      "Wokha",
      "Zunheboto",
    ],
  },
  {
    name: "Odisha",
    type: "STATE",
    districts: [
      "Angul",
      "Balangir",
      "Balasore",
      "Bargarh",
      "Bhadrak",
      "Boudh",
      "Cuttack",
      "Deogarh",
      "Dhenkanal",
      "Gajapati",
      "Ganjam",
      "Jagatsinghpur",
      "Jajpur",
      "Jharsuguda",
      "Kalahandi",
      "Kandhamal",
      "Kendrapara",
      "Kendujhar",
      "Khordha",
      "Koraput",
      "Malkangiri",
      "Mayurbhanj",
      "Nabarangpur",
      "Nayagarh",
      "Nuapada",
      "Puri",
      "Rayagada",
      "Sambalpur",
      "Subarnapur",
      "Sundargarh",
    ],
  },
  {
    name: "Punjab",
    type: "STATE",
    districts: [
      "Amritsar",
      "Barnala",
      "Bathinda",
      "Faridkot",
      "Fatehgarh Sahib",
      "Fazilka",
      "Ferozepur",
      "Gurdaspur",
      "Hoshiarpur",
      "Jalandhar",
      "Kapurthala",
      "Ludhiana",
      "Malerkotla",
      "Mansa",
      "Moga",
      "Pathankot",
      "Patiala",
      "Rupnagar",
      "Sahibzada Ajit Singh Nagar",
      "Sangrur",
      "Shahid Bhagat Singh Nagar",
      "Sri Muktsar Sahib",
      "Tarn Taran",
    ],
  },
  {
    name: "Rajasthan",
    type: "STATE",
    districts: [
      "Ajmer",
      "Alwar",
      "Anupgarh",
      "Balotra",
      "Banswara",
      "Baran",
      "Barmer",
      "Beawar",
      "Bharatpur",
      "Bhilwara",
      "Bikaner",
      "Bundi",
      "Chittorgarh",
      "Churu",
      "Dausa",
      "Deeg",
      "Dholpur",
      "Didwana-Kuchaman",
      "Dudu",
      "Dungarpur",
      "Gangapur City",
      "Hanumangarh",
      "Jaipur",
      "Jaipur Rural",
      "Jaisalmer",
      "Jalore",
      "Jhalawar",
      "Jhunjhunu",
      "Jodhpur",
      "Jodhpur Rural",
      "Karauli",
      "Kekri",
      "Khairthal-Tijara",
      "Kota",
      "Kotputli-Behror",
      "Nagaur",
      "Neem Ka Thana",
      "Pali",
      "Phalodi",
      "Pratapgarh",
      "Rajsamand",
      "Salumbar",
      "Sanchore",
      "Sawai Madhopur",
      "Shahpura",
      "Sikar",
      "Sirohi",
      "Sri Ganganagar",
      "Tonk",
      "Udaipur",
    ],
  },
  {
    name: "Sikkim",
    type: "STATE",
    districts: [
      "Gangtok",
      "Gyalshing",
      "Mangan",
      "Namchi",
      "Pakyong",
      "Soreng",
    ],
  },
  {
    name: "Tamil Nadu",
    type: "STATE",
    districts: [
      "Ariyalur",
      "Chengalpattu",
      "Chennai",
      "Coimbatore",
      "Cuddalore",
      "Dharmapuri",
      "Dindigul",
      "Erode",
      "Kallakurichi",
      "Kanchipuram",
      "Kanyakumari",
      "Karur",
      "Krishnagiri",
      "Madurai",
      "Mayiladuthurai",
      "Nagapattinam",
      "Namakkal",
      "Nilgiris",
      "Perambalur",
      "Pudukkottai",
      "Ramanathapuram",
      "Ranipet",
      "Salem",
      "Sivaganga",
      "Tenkasi",
      "Thanjavur",
      "Theni",
      "Thoothukudi",
      "Tiruchirappalli",
      "Tirunelveli",
      "Tirupathur",
      "Tiruppur",
      "Tiruvallur",
      "Tiruvannamalai",
      "Tiruvarur",
      "Vellore",
      "Viluppuram",
      "Virudhunagar",
    ],
  },
  {
    name: "Telangana",
    type: "STATE",
    districts: [
      "Adilabad",
      "Bhadradri Kothagudem",
      "Hanumakonda",
      "Hyderabad",
      "Jagtial",
      "Jangaon",
      "Jayashankar Bhupalpally",
      "Jogulamba Gadwal",
      "Kamareddy",
      "Karimnagar",
      "Khammam",
      "Kumuram Bheem Asifabad",
      "Mahabubabad",
      "Mahbubnagar",
      "Mancherial",
      "Medak",
      "Medchal-Malkajgiri",
      "Mulugu",
      "Nagarkurnool",
      "Nalgonda",
      "Narayanpet",
      "Nirmal",
      "Nizamabad",
      "Peddapalli",
      "Rajanna Sircilla",
      "Ranga Reddy",
      "Sangareddy",
      "Siddipet",
      "Suryapet",
      "Vikarabad",
      "Wanaparthy",
      "Warangal",
      "Yadadri Bhuvanagiri",
    ],
  },
  {
    name: "Tripura",
    type: "STATE",
    districts: [
      "Dhalai",
      "Gomati",
      "Khowai",
      "North Tripura",
      "Sepahijala",
      "South Tripura",
      "Unakoti",
      "West Tripura",
    ],
  },
  {
    name: "Uttar Pradesh",
    type: "STATE",
    districts: [
      "Agra",
      "Aligarh",
      "Ambedkar Nagar",
      "Amethi",
      "Amroha",
      "Auraiya",
      "Ayodhya",
      "Azamgarh",
      "Baghpat",
      "Bahraich",
      "Ballia",
      "Balrampur",
      "Banda",
      "Barabanki",
      "Bareilly",
      "Basti",
      "Bhadohi",
      "Bijnor",
      "Budaun",
      "Bulandshahr",
      "Chandauli",
      "Chitrakoot",
      "Deoria",
      "Etah",
      "Etawah",
      "Farrukhabad",
      "Fatehpur",
      "Firozabad",
      "Gautam Buddha Nagar",
      "Ghaziabad",
      "Ghazipur",
      "Gonda",
      "Gorakhpur",
      "Hamirpur",
      "Hapur",
      "Hardoi",
      "Hathras",
      "Jalaun",
      "Jaunpur",
      "Jhansi",
      "Kannauj",
      "Kanpur Dehat",
      "Kanpur Nagar",
      "Kasganj",
      "Kaushambi",
      "Kushinagar",
      "Lakhimpur Kheri",
      "Lalitpur",
      "Lucknow",
      "Maharajganj",
      "Mahoba",
      "Mainpuri",
      "Mathura",
      "Mau",
      "Meerut",
      "Mirzapur",
      "Moradabad",
      "Muzaffarnagar",
      "Pilibhit",
      "Pratapgarh",
      "Prayagraj",
      "Raebareli",
      "Rampur",
      "Saharanpur",
      "Sambhal",
      "Sant Kabir Nagar",
      "Shahjahanpur",
      "Shamli",
      "Shravasti",
      "Siddharthnagar",
      "Sitapur",
      "Sonbhadra",
      "Sultanpur",
      "Unnao",
      "Varanasi",
    ],
  },
  {
    name: "Uttarakhand",
    type: "STATE",
    districts: [
      "Almora",
      "Bageshwar",
      "Chamoli",
      "Champawat",
      "Dehradun",
      "Haridwar",
      "Nainital",
      "Pauri Garhwal",
      "Pithoragarh",
      "Rudraprayag",
      "Tehri Garhwal",
      "Udham Singh Nagar",
      "Uttarkashi",
    ],
  },
  {
    name: "West Bengal",
    type: "STATE",
    districts: [
      "Alipurduar",
      "Bankura",
      "Birbhum",
      "Cooch Behar",
      "Dakshin Dinajpur",
      "Darjeeling",
      "Hooghly",
      "Howrah",
      "Jalpaiguri",
      "Jhargram",
      "Kalimpong",
      "Kolkata",
      "Malda",
      "Murshidabad",
      "Nadia",
      "North 24 Parganas",
      "Paschim Bardhaman",
      "Paschim Medinipur",
      "Purba Bardhaman",
      "Purba Medinipur",
      "Purulia",
      "South 24 Parganas",
      "Uttar Dinajpur",
    ],
  },
  {
    name: "Andaman and Nicobar Islands",
    type: "UT",
    districts: [
      "Nicobar",
      "North and Middle Andaman",
      "South Andaman",
    ],
  },
  {
    name: "Chandigarh",
    type: "UT",
    districts: [
      "Chandigarh",
    ],
  },
  {
    name: "Dadra and Nagar Haveli and Daman and Diu",
    type: "UT",
    districts: [
      "Dadra and Nagar Haveli",
      "Daman",
      "Diu",
    ],
  },
  {
    name: "Delhi",
    type: "UT",
    districts: [
      "Central Delhi",
      "East Delhi",
      "New Delhi",
      "North Delhi",
      "North East Delhi",
      "North West Delhi",
      "Shahdara",
      "South Delhi",
      "South East Delhi",
      "South West Delhi",
      "West Delhi",
    ],
  },
  {
    name: "Jammu and Kashmir",
    type: "UT",
    districts: [
      "Anantnag",
      "Bandipora",
      "Baramulla",
      "Budgam",
      "Doda",
      "Ganderbal",
      "Jammu",
      "Kathua",
      "Kishtwar",
      "Kulgam",
      "Kupwara",
      "Poonch",
      "Pulwama",
      "Rajouri",
      "Ramban",
      "Reasi",
      "Samba",
      "Shopian",
      "Srinagar",
      "Udhampur",
    ],
  },
  {
    name: "Ladakh",
    type: "UT",
    districts: [
      "Kargil",
      "Leh",
    ],
  },
  {
    name: "Lakshadweep",
    type: "UT",
    districts: [
      "Lakshadweep",
    ],
  },
  {
    name: "Puducherry",
    type: "UT",
    districts: [
      "Karaikal",
      "Mahe",
      "Puducherry",
      "Yanam",
    ],
  },
];

// ------------------------------------------------------------------------------
// Internal Indexed Lookup Tables (Constructed Once at Runtime for O(1) Lookups)
// ------------------------------------------------------------------------------

interface FlatDistrictEntry {
  districtName: string;
  stateName: string;
  normalizedDistrict: string;
  normalizedState: string;
}

const STATE_MAP = new Map<string, CanonicalState>();
const DISTRICT_MAP = new Map<string, FlatDistrictEntry[]>();
const ALL_FLAT_DISTRICTS: FlatDistrictEntry[] = [];

// Initialize lookup caches
for (const state of CANONICAL_STATES_DATA) {
  STATE_MAP.set(state.name.toLowerCase(), state);
  for (const district of state.districts) {
    const entry: FlatDistrictEntry = {
      districtName: district,
      stateName: state.name,
      normalizedDistrict: district.toLowerCase(),
      normalizedState: state.name.toLowerCase(),
    };
    ALL_FLAT_DISTRICTS.push(entry);
    const existing = DISTRICT_MAP.get(entry.normalizedDistrict) || [];
    existing.push(entry);
    DISTRICT_MAP.set(entry.normalizedDistrict, existing);
  }
}

// ------------------------------------------------------------------------------
// Exported Lookup & Query Helpers
// ------------------------------------------------------------------------------

/**
 * Returns a sorted list of all 36 canonical Indian State & UT names.
 */
export function getAllStates(): string[] {
  return CANONICAL_STATES_DATA.map((s) => s.name);
}

/**
 * Returns the raw detailed list of all states and their districts.
 */
export function getAllStatesDetailed(): readonly CanonicalState[] {
  return CANONICAL_STATES_DATA;
}

/**
 * Returns sorted list of districts belonging to a specific State/UT.
 * Case-insensitive lookup. Returns empty array if state is not found.
 */
export function getDistrictsByState(stateName: string): string[] {
  if (!stateName || !stateName.trim()) return [];
  const state = STATE_MAP.get(stateName.trim().toLowerCase());
  return state ? [...state.districts] : [];
}

/**
 * Finds a State/UT by case-insensitive name match.
 */
export function findState(stateName: string): CanonicalState | null {
  if (!stateName || !stateName.trim()) return null;
  return STATE_MAP.get(stateName.trim().toLowerCase()) || null;
}

/**
 * Validates whether a state and district combination is authentic.
 */
export function isValidStateDistrict(stateName: string, districtName: string): boolean {
  if (!stateName || !districtName) return false;
  const state = STATE_MAP.get(stateName.trim().toLowerCase());
  if (!state) return false;
  const normDist = districtName.trim().toLowerCase();
  return state.districts.some((d) => d.toLowerCase() === normDist);
}

/**
 * Searches districts by case-insensitive name query.
 */
export function findDistricts(query: string, limit: number = 20): LocationSearchResult[] {
  if (!query || !query.trim()) return [];
  const q = query.trim().toLowerCase();

  const matches: { entry: FlatDistrictEntry; score: number }[] = [];

  for (const entry of ALL_FLAT_DISTRICTS) {
    if (entry.normalizedDistrict === q) {
      matches.push({ entry, score: 1 });
    } else if (entry.normalizedDistrict.startsWith(q)) {
      matches.push({ entry, score: 2 });
    } else if (entry.normalizedDistrict.includes(q)) {
      matches.push({ entry, score: 3 });
    }
  }

  matches.sort((a, b) => {
    if (a.score !== b.score) return a.score - b.score;
    const cmp = a.entry.districtName.localeCompare(b.entry.districtName);
    if (cmp !== 0) return cmp;
    return a.entry.stateName.localeCompare(b.entry.stateName);
  });

  return matches.slice(0, limit).map((m) => ({
    state: m.entry.stateName,
    district: m.entry.districtName,
    type: "DISTRICT",
    label: `${m.entry.districtName}, ${m.entry.stateName}`,
  }));
}

/**
 * Unified Location Search Helper:
 * Searches both States and Districts with predictable relevance ranking:
 * 1. Exact match (State or District)
 * 2. Prefix match (State or District)
 * 3. District within State combination match (e.g. "Delhi Dwarka" or "Dwarka, Gujarat")
 * 4. Substring contains match
 *
 * Deterministic, case-insensitive, whitespace-normalized.
 */
export function searchLocations(query: string, limit: number = 15): LocationSearchResult[] {
  if (!query || !query.trim()) {
    return [];
  }

  const rawQuery = query.trim().replace(/\s+/g, " ");
  const q = rawQuery.toLowerCase();
  const qTokens = q.split(/[\s,]+/).filter((t) => t.length > 0);

  const results: { item: LocationSearchResult; score: number }[] = [];
  const seenLabels = new Set<string>();

  // 1. Search States
  for (const state of CANONICAL_STATES_DATA) {
    const normState = state.name.toLowerCase();
    if (normState === q) {
      results.push({
        item: { state: state.name, district: null, type: "STATE", label: state.name },
        score: 1,
      });
      seenLabels.add(state.name);
    } else if (normState.startsWith(q)) {
      results.push({
        item: { state: state.name, district: null, type: "STATE", label: state.name },
        score: 3,
      });
      seenLabels.add(state.name);
    } else if (normState.includes(q)) {
      results.push({
        item: { state: state.name, district: null, type: "STATE", label: state.name },
        score: 5,
      });
      seenLabels.add(state.name);
    }
  }

  // 2. Search Districts (and State + District multi-token combinations)
  for (const entry of ALL_FLAT_DISTRICTS) {
    const label = `${entry.districtName}, ${entry.stateName}`;
    if (seenLabels.has(label)) continue;

    const normDist = entry.normalizedDistrict;
    const normState = entry.normalizedState;

    if (normDist === q) {
      results.push({
        item: { state: entry.stateName, district: entry.districtName, type: "DISTRICT", label },
        score: 1,
      });
      seenLabels.add(label);
    } else if (normDist.startsWith(q)) {
      results.push({
        item: { state: entry.stateName, district: entry.districtName, type: "DISTRICT", label },
        score: 2,
      });
      seenLabels.add(label);
    } else if (normDist.includes(q)) {
      results.push({
        item: { state: entry.stateName, district: entry.districtName, type: "DISTRICT", label },
        score: 4,
      });
      seenLabels.add(label);
    } else if (qTokens.length > 1) {
      // Multi-token query check: e.g. "Delhi Dwarka" or "Kota Rajasthan"
      const allTokensMatch = qTokens.every(
        (token) => normDist.includes(token) || normState.includes(token)
      );
      if (allTokensMatch) {
        results.push({
          item: { state: entry.stateName, district: entry.districtName, type: "DISTRICT", label },
          score: 3,
        });
        seenLabels.add(label);
      }
    }
  }

  // Sort by ranking tier, then alphabetically by label
  results.sort((a, b) => {
    if (a.score !== b.score) return a.score - b.score;
    return a.item.label.localeCompare(b.item.label);
  });

  return results.slice(0, limit).map((r) => r.item);
}
