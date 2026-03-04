import List "mo:core/List";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Map "mo:core/Map";
import Iter "mo:core/Iter";
import Array "mo:core/Array";
import Int "mo:core/Int";
import Nat "mo:core/Nat";
import Order "mo:core/Order";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";

actor {
  // Initialize the access control system
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  // Data Types
  type Gender = {
    #male;
    #female;
    #other;
  };

  type Severity = {
    #low;
    #medium;
    #high;
    #emergency;
  };

  type DiagnosisRecord = {
    id : Text;
    patientId : Principal;
    imageRef : Storage.ExternalBlob;
    conditionName : Text;
    confidenceScore : Nat;
    severity : Severity;
    treatmentAdvice : Text;
    otcMedicines : [Text];
    consultationRecommended : Bool;
    isEmergency : Bool;
    timestamp : Time.Time;
    doctorNotes : ?Text;
  };

  type MedicalHistoryEntry = {
    timestamp : Time.Time;
    notes : Text;
  };

  type BasicPatientInfo = {
    name : Text;
    age : Nat;
    gender : Gender;
    phone : Text;
    bloodType : ?Text;
    allergies : [Text];
    existingConditions : [Text];
  };

  type PatientProfile = {
    info : BasicPatientInfo;
    medicalHistory : [MedicalHistoryEntry];
  };

  type DoctorProfile = {
    name : Text;
    specialty : Text;
    licenseNumber : Text;
    bio : Text;
    availableSlots : [Time.Time];
    approved : Bool;
  };

  // Diagnostic Result
  type DiagnosticResult = {
    conditionName : Text;
    confidenceScore : Nat;
    severity : Severity;
    treatmentAdvice : Text;
    otcMedicines : [Text];
    consultationRecommended : Bool;
    isEmergency : Bool;
  };

  type Appointment = {
    doctorId : Principal;
    patientId : Principal;
    dateTime : Time.Time;
    reason : Text;
  };

  module DiagnosisRecord {
    public func compare(d1 : DiagnosisRecord, d2 : DiagnosisRecord) : Order.Order {
      Text.compare(d1.id, d2.id);
    };
  };

  // Maps
  let patientProfiles = Map.empty<Principal, PatientProfile>();
  let diagnosisRecords = Map.empty<Text, DiagnosisRecord>();
  let doctorProfiles = Map.empty<Principal, DoctorProfile>();
  let appointments = Map.empty<Text, Appointment>();

  // Helper functions for role checking
  func isDoctor(principal : Principal) : Bool {
    switch (doctorProfiles.get(principal)) {
      case (null) { false };
      case (?profile) { profile.approved };
    };
  };

  func isPatient(principal : Principal) : Bool {
    switch (patientProfiles.get(principal)) {
      case (null) { false };
      case (?_) { true };
    };
  };

  // Patient Profiles
  public shared ({ caller }) func createOrUpdatePatientProfile(profile : PatientProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create/update patient profiles");
    };
    patientProfiles.add(caller, profile);
  };

  public query ({ caller }) func getOwnPatientProfile() : async PatientProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view patient profiles");
    };
    switch (patientProfiles.get(caller)) {
      case (null) { Runtime.trap("Profile not found") };
      case (?profile) { profile };
    };
  };

  public shared ({ caller }) func addMedicalHistoryEntry(entry : MedicalHistoryEntry) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add medical history");
    };
    switch (patientProfiles.get(caller)) {
      case (null) { Runtime.trap("Profile not found") };
      case (?profile) {
        let updatedHistory = profile.medicalHistory.concat([entry]);
        let updatedProfile = {
          info = profile.info;
          medicalHistory = updatedHistory;
        };
        patientProfiles.add(caller, updatedProfile);
      };
    };
  };

  public query ({ caller }) func getMedicalHistory() : async [MedicalHistoryEntry] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view medical history");
    };
    switch (patientProfiles.get(caller)) {
      case (null) { Runtime.trap("Profile not found") };
      case (?profile) { profile.medicalHistory };
    };
  };

  // Diagnosis
  public shared ({ caller }) func submitDiagnosis(record : DiagnosisRecord) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can submit diagnoses");
    };
    // Verify caller is either the patient or an approved doctor
    if (caller != record.patientId and not isDoctor(caller)) {
      Runtime.trap("Unauthorized: Can only submit diagnosis for yourself or as an approved doctor");
    };
    diagnosisRecords.add(record.id, record);
  };

  public query ({ caller }) func getDiagnosisById(id : Text) : async DiagnosisRecord {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view diagnoses");
    };
    switch (diagnosisRecords.get(id)) {
      case (null) { Runtime.trap("Diagnosis not found") };
      case (?record) {
        // Verify caller is the patient, a doctor, or admin
        if (caller != record.patientId and not isDoctor(caller) and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only view your own diagnoses");
        };
        record;
      };
    };
  };

  public query ({ caller }) func getPatientDiagnoses(start : Nat, end : Nat) : async [DiagnosisRecord] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view diagnoses");
    };
    // Filter to only caller's diagnoses
    let allRecords = diagnosisRecords.values().toArray();
    let filtered = allRecords.filter(func(record) { record.patientId == caller });
    filtered.sliceToArray(start, end);
  };

  public query ({ caller }) func getAllDiagnoses(start : Nat, end : Nat) : async [DiagnosisRecord] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all diagnoses");
    };
    let records = diagnosisRecords.values().toArray();
    records.sliceToArray(start, end);
  };

  public shared ({ caller }) func updateDoctorNotes(diagnosisId : Text, notes : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update doctor notes");
    };
    switch (diagnosisRecords.get(diagnosisId)) {
      case (null) { Runtime.trap("Diagnosis not found") };
      case (?record) {
        let updatedRecord = {
          id = record.id;
          patientId = record.patientId;
          imageRef = record.imageRef;
          conditionName = record.conditionName;
          confidenceScore = record.confidenceScore;
          severity = record.severity;
          treatmentAdvice = record.treatmentAdvice;
          otcMedicines = record.otcMedicines;
          consultationRecommended = record.consultationRecommended;
          isEmergency = record.isEmergency;
          timestamp = record.timestamp;
          doctorNotes = ?notes;
        };
        diagnosisRecords.add(diagnosisId, updatedRecord);
      };
    };
  };

  // Doctor Profiles
  public shared ({ caller }) func createOrUpdateDoctorProfile(profile : DoctorProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create/update doctor profiles");
    };
    doctorProfiles.add(caller, profile);
  };

  public query ({ caller }) func getApprovedDoctors() : async [DoctorProfile] {
    // Public function - no authorization needed
    let allDoctors = doctorProfiles.values().toArray();
    allDoctors.filter(func(profile) { profile.approved });
  };

  public shared ({ caller }) func approveDoctor(doctorId : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can approve doctors");
    };
    switch (doctorProfiles.get(doctorId)) {
      case (null) { Runtime.trap("Doctor not found") };
      case (?profile) {
        let updatedProfile = {
          name = profile.name;
          specialty = profile.specialty;
          licenseNumber = profile.licenseNumber;
          bio = profile.bio;
          availableSlots = profile.availableSlots;
          approved = true;
        };
        doctorProfiles.add(doctorId, updatedProfile);
      };
    };
  };

  public shared ({ caller }) func rejectDoctor(doctorId : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can reject doctors");
    };
    doctorProfiles.remove(doctorId);
  };

  // Appointments
  public shared ({ caller }) func bookAppointment(appointment : Appointment) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can book appointments");
    };
    // Verify caller is the patient booking the appointment
    if (caller != appointment.patientId) {
      Runtime.trap("Unauthorized: Can only book appointments for yourself");
    };
    appointments.add(appointment.doctorId.toText() # appointment.patientId.toText(), appointment);
  };

  public query ({ caller }) func getPatientAppointments(start : Nat, end : Nat) : async [Appointment] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view appointments");
    };
    // Filter to only caller's appointments as patient
    let allAppointments = appointments.values().toArray();
    let filtered = allAppointments.filter(func(appt) { appt.patientId == caller });
    filtered.sliceToArray(start, end);
  };

  public query ({ caller }) func getDoctorAppointments(start : Nat, end : Nat) : async [Appointment] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view appointments");
    };
    // Verify caller is an approved doctor
    if (not isDoctor(caller)) {
      Runtime.trap("Unauthorized: Only approved doctors can view their appointments");
    };
    // Filter to only caller's appointments as doctor
    let allAppointments = appointments.values().toArray();
    let filtered = allAppointments.filter(func(appt) { appt.doctorId == caller });
    filtered.sliceToArray(start, end);
  };

  // Admin
  public query ({ caller }) func getDashboardStats() : async {
    totalPatients : Nat;
    totalDiagnoses : Nat;
    emergencyCases : Nat;
    pendingDoctors : Nat;
  } {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view dashboard stats");
    };

    var emergencyCount = 0;
    var pendingCount = 0;

    let diagnosisIter = diagnosisRecords.values();
    let doctorIter = doctorProfiles.values();

    switch (diagnosisIter.next()) {
      case (null) {};
      case (?record) {
        if (record.severity == #emergency) {
          emergencyCount += 1;
        };
      };
    };

    switch (doctorIter.next()) {
      case (null) {};
      case (?profile) {
        if (not profile.approved) {
          pendingCount += 1;
        };
      };
    };

    {
      totalPatients = patientProfiles.size();
      totalDiagnoses = diagnosisRecords.size();
      emergencyCases = emergencyCount;
      pendingDoctors = pendingCount;
    };
  };

  // Diagnostic AI (Simulated)
  public shared ({ caller }) func analyze(imageRef : Storage.ExternalBlob) : async DiagnosticResult {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can analyze images");
    };

    let condition = "fungal_infection";

    let confidenceScore = 74;
    let severity = if (confidenceScore > 90) {
      #emergency;
    } else if (confidenceScore > 80) {
      #high;
    } else if (confidenceScore > 75) {
      #medium;
    } else {
      #low;
    };

    let otcMedicines = if (condition == "normal") {
      [];
    } else { [ "ibuprofen", "acetaminophen" ] };

    {
      conditionName = condition;
      confidenceScore;
      severity;
      treatmentAdvice = if (condition == "normal") { "No action needed" } else {
        "Consult a doctor if symptoms persist";
      };
      otcMedicines;
      consultationRecommended = if (severity == #high or severity == #emergency) {
        true;
      } else { false };
      isEmergency = severity == #emergency;
    };
  };

  // Required user profile functions for frontend
  public query ({ caller }) func getCallerUserProfile() : async ?BasicPatientInfo {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    switch (patientProfiles.get(caller)) {
      case (null) { null };
      case (?profile) { ?profile.info };
    };
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?BasicPatientInfo {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    switch (patientProfiles.get(user)) {
      case (null) { null };
      case (?profile) { ?profile.info };
    };
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : BasicPatientInfo) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    // Get existing profile or create new one
    let existingProfile = switch (patientProfiles.get(caller)) {
      case (null) {
        {
          info = profile;
          medicalHistory = [];
        };
      };
      case (?existing) {
        {
          info = profile;
          medicalHistory = existing.medicalHistory;
        };
      };
    };
    patientProfiles.add(caller, existingProfile);
  };
};
