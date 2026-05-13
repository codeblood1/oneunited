// Unified Supabase data hooks — replaces all tRPC calls
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";

// ============================================================
// BANKS & COUNTRIES
// ============================================================
export const BANKS = [
  { id: "oneunited", name: "OneUnited Bank", country: "US", swift: "OUNUUS33" },
  { id: "chase", name: "JPMorgan Chase", country: "US", swift: "CHASUS33" },
  { id: "bofa", name: "Bank of America", country: "US", swift: "BOFAUS3N" },
  { id: "wells", name: "Wells Fargo", country: "US", swift: "WFBIUS6S" },
  { id: "citibank", name: "Citibank", country: "US", swift: "CITIUS33" },
  { id: "barclays", name: "Barclays UK", country: "GB", swift: "BARCGB22" },
  { id: "hsbc", name: "HSBC", country: "GB", swift: "HBUKGB4B" },
  { id: "deutsche", name: "Deutsche Bank", country: "DE", swift: "DEUTDEFF" },
  { id: "comme", name: "Commerzbank", country: "DE", swift: "COBADEFF" },
  { id: "bnp", name: "BNP Paribas", country: "FR", swift: "BNPAFRPP" },
  { id: "socgen", name: "Societe Generale", country: "FR", swift: "SOGEFRPP" },
  { id: "santander", name: "Banco Santander", country: "ES", swift: "BSCHESMM" },
  { id: "unicredit", name: "UniCredit", country: "IT", swift: "UNCRITMM" },
  { id: "ing", name: "ING Bank", country: "NL", swift: "INGBNL2A" },
  { id: "rbc", name: "Royal Bank of Canada", country: "CA", swift: "ROYCCAT2" },
  { id: "td", name: "TD Bank", country: "CA", swift: "TDOMCATTT" },
  { id: "anz", name: "ANZ Bank", country: "AU", swift: "ANZBAU3M" },
  { id: "nab", name: "National Australia Bank", country: "AU", swift: "NATAAU33" },
  { id: "fnb", name: "First National Bank", country: "ZA", swift: "FIRNZAJJ" },
  { id: "gtbank", name: "GTBank", country: "NG", swift: "GTBINGLA" },
  { id: "zenith", name: "Zenith Bank", country: "NG", swift: "ZEIBNGLA" },
  { id: "uba", name: "UBA", country: "NG", swift: "UNAFNGLA" },
  { id: "mufg", name: "MUFG Bank", country: "JP", swift: "BOTKJPJT" },
  { id: "icici", name: "ICICI Bank", country: "IN", swift: "ICICINBB" },
  { id: "sbi", name: "State Bank of India", country: "IN", swift: "SBININBB" },
  { id: "scb", name: "Standard Chartered", country: "SG", swift: "SCBLSG22" },
  { id: "dbs", name: "DBS Bank", country: "SG", swift: "DBSSSGSG" },
  { id: "emirates", name: "Emirates NBD", country: "AE", swift: "EBILAEAD" },
  { id: "fab", name: "First Abu Dhabi Bank", country: "AE", swift: "FABMAEAA" },
  { id: "alrajhi", name: "Al Rajhi Bank", country: "SA", swift: "RJHISARI" },
] as const;

export const COUNTRIES = [
  { code: "US", name: "United States", currency: "USD", flag: "\ud83c\uddfa\ud83c\uddf8" },
  { code: "GB", name: "United Kingdom", currency: "GBP", flag: "\ud83c\uddec\ud83c\udde7" },
  { code: "DE", name: "Germany", currency: "EUR", flag: "\ud83c\udde9\ud83c\uddea" },
  { code: "FR", name: "France", currency: "EUR", flag: "\ud83c\uddeb\ud83c\uddf7" },
  { code: "ES", name: "Spain", currency: "EUR", flag: "\ud83c\uddea\ud83c\uddf8" },
  { code: "IT", name: "Italy", currency: "EUR", flag: "\ud83c\uddee\ud83c\uddf9" },
  { code: "NL", name: "Netherlands", currency: "EUR", flag: "\ud83c\uddf3\ud83c\uddf1" },
  { code: "CA", name: "Canada", currency: "CAD", flag: "\ud83c\udde8\ud83c\udde6" },
  { code: "AU", name: "Australia", currency: "AUD", flag: "\ud83c\udde6\ud83c\uddfa" },
  { code: "ZA", name: "South Africa", currency: "ZAR", flag: "\ud83c\uddff\ud83c\udde6" },
  { code: "NG", name: "Nigeria", currency: "NGN", flag: "\ud83c\uddf3\ud83c\uddec" },
  { code: "JP", name: "Japan", currency: "JPY", flag: "\ud83c\uddef\ud83c\uddf5" },
  { code: "IN", name: "India", currency: "INR", flag: "\ud83c\uddee\ud83c\uddf3" },
  { code: "SG", name: "Singapore", currency: "SGD", flag: "\ud83c\uddf8\ud83c\uddec" },
  { code: "AE", name: "UAE", currency: "AED", flag: "\ud83c\udde6\ud83c\uddea" },
  { code: "SA", name: "Saudi Arabia", currency: "SAR", flag: "\ud83c\uddf8\ud83c\udde6" },
] as const;

// ============================================================
// ACCOUNTS
// ============================================================
export type Account = {
  id: number;
  account_number: string;
  account_type: "checking" | "savings";
  balance: string | number;
  currency: string;
  bank_name?: string;
  bank_country?: string;
  swift_code?: string;
  is_active: boolean;
  created_at: string;
};

export function useAccounts() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAccounts = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) { setAccounts([]); setIsLoading(false); return; }

      const { data: userRow } = await supabase.from("users").select("id").eq("supabase_uid", userData.user.id).single();
      if (!userRow) { setAccounts([]); setIsLoading(false); return; }

      const { data, error: err } = await supabase
        .from("bank_accounts")
        .select("*")
        .eq("user_id", userRow.id)
        .order("created_at", { ascending: false });

      if (err) throw err;
      setAccounts(data || []);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      setAccounts([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchAccounts(); }, [fetchAccounts]);

  const createAccount = useCallback(async (type: "checking" | "savings", bankId?: string) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Not authenticated");

      const { data: userRow } = await supabase.from("users").select("id").eq("supabase_uid", userData.user.id).single();
      if (!userRow) throw new Error("User not found");

      const bank = bankId ? BANKS.find(b => b.id === bankId) : null;
      const country = bank ? COUNTRIES.find(c => c.code === bank.country) : null;

      // Generate account number
      const prefix = type === "checking" ? "CHK" : "SAV";
      const random = Math.floor(10000000 + Math.random() * 90000000);
      const accountNumber = `${prefix}${random}`;

      const { error: err } = await supabase.from("bank_accounts").insert({
        user_id: userRow.id,
        account_number: accountNumber,
        account_type: type,
        balance: "0.00",
        currency: country?.currency || "USD",
        bank_name: bank?.name || "OneUnited Bank",
        bank_country: bank?.country || "US",
        swift_code: bank?.swift || "OUNUUS33",
        is_active: true,
      });

      if (err) throw err;
      await fetchAccounts();
      return { success: true, error: null };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }, [fetchAccounts]);

  return { accounts, isLoading, error, createAccount, refresh: fetchAccounts };
}

// ============================================================
// TRANSACTIONS
// ============================================================
export type Transaction = {
  id: number;
  from_account_id: number | null;
  to_account_id: number | null;
  user_id: number;
  type: "deposit" | "withdrawal" | "transfer" | "payment";
  amount: string | number;
  currency: string;
  description: string | null;
  status: "pending" | "approved" | "rejected" | "completed";
  category: string | null;
  recipient_bank_name?: string;
  recipient_bank_country?: string;
  recipient_swift?: string;
  recipient_account_name?: string;
  created_at: string;
};

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) { setTransactions([]); setIsLoading(false); return; }

      const { data: userRow } = await supabase.from("users").select("id").eq("supabase_uid", userData.user.id).single();
      if (!userRow) { setTransactions([]); setIsLoading(false); return; }

      const { data, error: err } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", userRow.id)
        .order("created_at", { ascending: false });

      if (err) throw err;
      setTransactions(data || []);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      setTransactions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchTransactions(); }, [fetchTransactions]);

  const createTransfer = useCallback(async ({
    fromAccountId,
    toAccountNumber,
    amount,
    description,
    recipientBankName,
    recipientBankCountry,
    recipientSwift,
    recipientName,
  }: {
    fromAccountId: number;
    toAccountNumber: string;
    amount: string;
    description?: string;
    recipientBankId?: string;
    recipientBankName?: string;
    recipientBankCountry?: string;
    recipientSwift?: string;
    recipientName?: string;
  }) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Not authenticated");

      const { data: userRow } = await supabase.from("users").select("id").eq("supabase_uid", userData.user.id).single();
      if (!userRow) throw new Error("User not found");

      const { data: fromAcc } = await supabase.from("bank_accounts").select("balance").eq("id", fromAccountId).single();
      if (!fromAcc) throw new Error("Source account not found");

      const currentBal = parseFloat(fromAcc.balance as string) || 0;
      const transferAmt = parseFloat(amount);
      if (currentBal < transferAmt) throw new Error("Insufficient balance");

      // Deduct balance from source account
      const newBalance = (currentBal - transferAmt).toFixed(2);
      const { error: balErr } = await supabase.from("bank_accounts").update({ balance: newBalance }).eq("id", fromAccountId);
      if (balErr) throw new Error("Failed to update balance: " + balErr.message);

      // Create transaction record
      const { error: err } = await supabase.from("transactions").insert({
        user_id: userRow.id,
        from_account_id: fromAccountId,
        type: "transfer",
        amount,
        description: description || `Transfer to ${toAccountNumber}`,
        status: "completed",
        recipient_bank_name: recipientBankName,
        recipient_bank_country: recipientBankCountry,
        recipient_swift: recipientSwift,
        recipient_account_name: recipientName,
      });

      if (err) throw err;
      await fetchTransactions();
      return { success: true, error: null };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }, [fetchTransactions]);

  return { transactions, isLoading, error, createTransfer, refresh: fetchTransactions };
}

// ============================================================
// KYC
// ============================================================
export type KycData = {
  id: number;
  user_id: number;
  id_type: "passport" | "drivers_license" | "national_id";
  id_number: string;
  id_front_image: string | null;
  id_back_image: string | null;
  selfie_image: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  country: string | null;
  status: "pending" | "approved" | "rejected";
  admin_note: string | null;
  reviewed_at: string | null;
  submitted_at: string;
};

export function useKyc() {
  const [kycData, setKycData] = useState<KycData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchKyc = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) { setKycData(null); setIsLoading(false); return; }

      const { data: userRow } = await supabase.from("users").select("id,kyc_status").eq("supabase_uid", userData.user.id).single();
      if (!userRow) { setKycData(null); setIsLoading(false); return; }

      const { data, error: err } = await supabase
        .from("kyc_submissions")
        .select("*")
        .eq("user_id", userRow.id)
        .order("submitted_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (err) throw err;
      setKycData(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchKyc(); }, [fetchKyc]);

  const submitKyc = useCallback(async ({
    idType,
    idNumber,
    address,
    city,
    state,
    zipCode,
    country,
    frontImageUrl,
    backImageUrl,
  }: {
    idType: "passport" | "drivers_license" | "national_id";
    idNumber: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
    frontImageUrl?: string;
    backImageUrl?: string;
  }) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Not authenticated");

      const { data: userRow } = await supabase.from("users").select("id").eq("supabase_uid", userData.user.id).single();
      if (!userRow) throw new Error("User not found");

      // Insert KYC submission
      const { error: err } = await supabase.from("kyc_submissions").insert({
        user_id: userRow.id,
        id_type: idType,
        id_number: idNumber,
        address: address || null,
        city: city || null,
        state: state || null,
        zip_code: zipCode || null,
        country: country || null,
        id_front_image: frontImageUrl || null,
        id_back_image: backImageUrl || null,
        status: "pending",
      });

      if (err) throw err;

      // Update user kyc_status
      await supabase.from("users").update({ kyc_status: "pending" }).eq("id", userRow.id);

      await fetchKyc();
      return { success: true, error: null };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }, [fetchKyc]);

  return { kycData, isLoading, error, submitKyc, refresh: fetchKyc };
}

// ============================================================
// CARD REQUESTS
// ============================================================
export type CardType = "visa_debit" | "mastercard_debit" | "virtual";

export type CardRequest = {
  id: number;
  user_id: number;
  card_type: CardType;
  cardholder_name: string;
  status: "pending" | "approved" | "rejected";
  card_number: string | null;
  expiry_date: string | null;
  cvv: string | null;
  admin_note: string | null;
  created_at: string;
  approved_at: string | null;
};

export function useCardRequests() {
  const [cards, setCards] = useState<CardRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCards = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) { setCards([]); setIsLoading(false); return; }
      const { data: userRow } = await supabase.from("users").select("id").eq("supabase_uid", userData.user.id).single();
      if (!userRow) { setCards([]); setIsLoading(false); return; }
      const { data, error: err } = await supabase.from("card_requests").select("*").eq("user_id", userRow.id).order("created_at", { ascending: false });
      if (err) throw err;
      setCards(data || []);
    } catch {
      setCards([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchCards(); }, [fetchCards]);

  const requestCard = useCallback(async (cardType: CardType, cardholderName: string) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Not authenticated");
      const { data: userRow } = await supabase.from("users").select("id").eq("supabase_uid", userData.user.id).single();
      if (!userRow) throw new Error("User not found");

      // Check if user already has a pending request for this card type
      const { data: existing } = await supabase.from("card_requests")
        .select("id").eq("user_id", userRow.id).eq("card_type", cardType).eq("status", "pending").maybeSingle();
      if (existing) throw new Error("You already have a pending request for this card type");

      const { error: err } = await supabase.from("card_requests").insert({
        user_id: userRow.id,
        card_type: cardType,
        cardholder_name: cardholderName,
        status: "pending",
      });
      if (err) throw err;
      await fetchCards();
      return { success: true, error: null };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }, [fetchCards]);

  return { cards, isLoading, requestCard, refresh: fetchCards };
}

// Admin card management
export function useAdminCards() {
  const [cardRequests, setCardRequests] = useState<CardRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCardRequests = useCallback(async (status?: string, limit = 100) => {
    setIsLoading(true);
    try {
      let query = supabase.from("card_requests").select("*").order("created_at", { ascending: false }).limit(limit);
      if (status && status !== "all") query = query.eq("status", status);
      const { data, error: err } = await query;
      if (err) throw err;
      setCardRequests(data || []);
    } catch {
      setCardRequests([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const approveCard = useCallback(async (cardId: number, adminNote?: string) => {
    // Generate card details
    const cardNumber = Array.from({ length: 16 }, () => Math.floor(Math.random() * 10)).join("").replace(/(.{4})/g, "$1 ").trim();
    const expiryDate = new Date(Date.now() + 3 * 365 * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", { month: "2-digit", year: "2-digit" });
    const cvv = String(Math.floor(100 + Math.random() * 900));

    const { error: err } = await supabase.from("card_requests").update({
      status: "approved",
      card_number: cardNumber,
      expiry_date: expiryDate,
      cvv,
      admin_note: adminNote || null,
      approved_at: new Date().toISOString(),
    }).eq("id", cardId);

    if (err) throw new Error(err.message);
  }, []);

  const rejectCard = useCallback(async (cardId: number, adminNote?: string) => {
    const { error: err } = await supabase.from("card_requests").update({
      status: "rejected",
      admin_note: adminNote || null,
    }).eq("id", cardId);
    if (err) throw new Error(err.message);
  }, []);

  return { cardRequests, isLoading, fetchCardRequests, approveCard, rejectCard };
}

// ============================================================
// FILE UPLOAD
// ============================================================
export async function uploadKycDocument(file: File, type: "front" | "back") {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error("Not authenticated");

    const fileExt = file.name.split(".").pop() || "jpg";
    const fileName = `kyc/${userData.user.id}/${type}_${Date.now()}.${fileExt}`;

    const { error: uploadErr } = await supabase.storage
      .from("documents")
      .upload(fileName, file, { contentType: file.type });

    if (uploadErr) {
      if (uploadErr.message?.includes("bucket") || uploadErr.message?.includes("Not found")) {
        throw new Error("Storage bucket not found. Create 'documents' bucket in Supabase Storage.");
      }
      throw new Error(`Upload failed: ${uploadErr.message}`);
    }

    const { data: { publicUrl } } = supabase.storage.from("documents").getPublicUrl(fileName);
    return publicUrl;
  } catch (err: any) {
    if (err.message?.includes("Storage bucket")) throw err;
    throw new Error(err.message || "Document upload failed");
  }
}

export async function uploadAvatar(file: File) {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error("Not authenticated");

    const fileExt = file.name.split(".").pop() || "jpg";
    const fileName = `avatars/${userData.user.id}.${fileExt}`;

    const { error: uploadErr } = await supabase.storage
      .from("documents")
      .upload(fileName, file, { contentType: file.type, upsert: true });

    if (uploadErr) {
      if (uploadErr.message?.includes("bucket") || uploadErr.message?.includes("Not found")) {
        throw new Error("Storage bucket not found. Create 'documents' bucket in Supabase Storage.");
      }
      throw new Error(`Upload failed: ${uploadErr.message}`);
    }

    const { data: { publicUrl } } = supabase.storage.from("documents").getPublicUrl(fileName);

    // Update user avatar
    const { data: userRow } = await supabase.from("users").select("id").eq("supabase_uid", userData.user.id).single();
    if (userRow) {
      await supabase.from("users").update({ avatar: publicUrl }).eq("id", userRow.id);
    }

    return publicUrl;
  } catch (err: any) {
    if (err.message?.includes("Storage bucket")) throw err;
    throw new Error(err.message || "Avatar upload failed");
  }
}

// ============================================================
// THEME
// ============================================================
export function useTheme() {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("theme") === "dark" ||
      (!localStorage.getItem("theme") && window.matchMedia("(prefers-color-scheme: dark)").matches);
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  const toggle = useCallback(() => setIsDark(d => !d), []);

  return { isDark, toggle };
}

// ============================================================
// NOTIFICATIONS
// ============================================================
export type Notification = {
  id: number;
  user_id: number;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "transfer" | "security";
  is_read: boolean;
  created_at: string;
};

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const unreadCount = notifications.filter(n => !n.is_read).length;

  const fetchNotifications = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) { setNotifications([]); setIsLoading(false); return; }

      const { data: userRow } = await supabase.from("users").select("id").eq("supabase_uid", userData.user.id).single();
      if (!userRow) { setNotifications([]); setIsLoading(false); return; }

      const { data, error: err } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", userRow.id)
        .order("created_at", { ascending: false })
        .limit(20);

      if (err) throw err;
      setNotifications(data || []);
    } catch {
      setNotifications([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  const markAsRead = useCallback(async (id: number) => {
    await supabase.from("notifications").update({ is_read: true }).eq("id", id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  }, []);

  const markAllRead = useCallback(async () => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;
    const { data: userRow } = await supabase.from("users").select("id").eq("supabase_uid", userData.user.id).single();
    if (!userRow) return;
    await supabase.from("notifications").update({ is_read: true }).eq("user_id", userRow.id);
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  }, []);

  return { notifications, isLoading, unreadCount, markAsRead, markAllRead, refresh: fetchNotifications };
}

// ============================================================
// ADMIN HOOKS — Direct Supabase (no tRPC)
// ============================================================

export type AdminUser = {
  id: number;
  supabase_uid: string;
  name: string | null;
  email: string | null;
  role: string;
  kyc_status: string;
  is_active: boolean;
  created_at: string;
};

export type AdminTransaction = Transaction & { user_id: number };

export type AdminKycItem = {
  id: number;
  user_id: number;
  id_type: string;
  id_number: string;
  address: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  country: string | null;
  id_front_image: string | null;
  id_back_image: string | null;
  status: string;
  admin_note: string | null;
  submitted_at: string;
};

export type AdminAccount = {
  id: number;
  user_id: number;
  account_number: string;
  account_type: string;
  balance: string;
  currency: string;
  bank_name: string | null;
  bank_country: string | null;
  swift_code: string | null;
  is_active: boolean;
  created_at: string;
};

export type AdminStats = {
  totalUsers: number;
  totalAccounts: number;
  totalTransactions: number;
  pendingTransactions: number;
  pendingKyc: number;
  totalBalance: number;
};

export function useAdminStats() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    setIsLoading(true);
    try {
      // Get counts in parallel
      const [{ count: totalUsers }, { count: totalAccounts }, { count: totalTransactions },
             { count: pendingTransactions }, { count: pendingKyc }, { data: accounts }] = await Promise.all([
        supabase.from("users").select("*", { count: "exact", head: true }),
        supabase.from("bank_accounts").select("*", { count: "exact", head: true }),
        supabase.from("transactions").select("*", { count: "exact", head: true }),
        supabase.from("transactions").select("*", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("kyc_submissions").select("*", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("bank_accounts").select("balance"),
      ]);

      const totalBalance = (accounts || []).reduce((sum, a) => sum + (parseFloat(a.balance as string) || 0), 0);

      setStats({
        totalUsers: totalUsers || 0,
        totalAccounts: totalAccounts || 0,
        totalTransactions: totalTransactions || 0,
        pendingTransactions: pendingTransactions || 0,
        pendingKyc: pendingKyc || 0,
        totalBalance,
      });
    } catch {
      setStats(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);
  return { stats, isLoading, refresh: fetchStats };
}

export function useAdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsers = useCallback(async (search?: string, role?: string, limit = 20, offset = 0) => {
    setIsLoading(true);
    try {
      let query = supabase.from("users").select("*").order("created_at", { ascending: false }).range(offset, offset + limit - 1);
      if (search) query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
      if (role) query = query.eq("role", role);
      const { data, error: err } = await query;
      if (err) throw err;
      setUsers(data || []);
    } catch {
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateUser = useCallback(async (userId: number, updates: { role?: string; isActive?: boolean }) => {
    const { error: err } = await supabase.from("users").update(updates).eq("id", userId);
    if (err) throw new Error(err.message);
  }, []);

  return { users, isLoading, fetchUsers, updateUser };
}

export function useAdminTransactions() {
  const [transactions, setTransactions] = useState<AdminTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTransactions = useCallback(async (status?: string, limit = 100) => {
    setIsLoading(true);
    try {
      let query = supabase.from("transactions").select("*").order("created_at", { ascending: false }).limit(limit);
      if (status && status !== "all") query = query.eq("status", status);
      const { data, error: err } = await query;
      if (err) throw err;
      setTransactions(data || []);
    } catch {
      setTransactions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateStatus = useCallback(async (txId: number, status: string) => {
    const { error: err } = await supabase.from("transactions").update({ status }).eq("id", txId);
    if (err) throw new Error(err.message);
  }, []);

  return { transactions, isLoading, fetchTransactions, updateStatus };
}

export function useAdminKyc() {
  const [kycList, setKycList] = useState<AdminKycItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchKyc = useCallback(async (status?: string, limit = 100) => {
    setIsLoading(true);
    try {
      let query = supabase.from("kyc_submissions").select("*").order("submitted_at", { ascending: false }).limit(limit);
      if (status && status !== "all") query = query.eq("status", status);
      const { data, error: err } = await query;
      if (err) throw err;
      setKycList(data || []);
    } catch {
      setKycList([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateKyc = useCallback(async (kycId: number, status: string, adminNote?: string) => {
    const { error: err } = await supabase.from("kyc_submissions").update({ status, admin_note: adminNote || null, reviewed_at: new Date().toISOString() }).eq("id", kycId);
    if (err) throw new Error(err.message);

    // Update user's kyc_status
    const { data: kycRow } = await supabase.from("kyc_submissions").select("user_id").eq("id", kycId).single();
    if (kycRow) {
      const kycStatus = status === "approved" ? "verified" : "rejected";
      await supabase.from("users").update({ kyc_status: kycStatus }).eq("id", kycRow.user_id);
    }
  }, []);

  return { kycList, isLoading, fetchKyc, updateKyc };
}

export function useAdminAccounts() {
  const [accounts, setAccounts] = useState<AdminAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAccounts = useCallback(async (limit = 100) => {
    setIsLoading(true);
    try {
      const { data, error: err } = await supabase.from("bank_accounts").select("*").order("created_at", { ascending: false }).limit(limit);
      if (err) throw err;
      setAccounts(data || []);
    } catch {
      setAccounts([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateBalance = useCallback(async (accountId: number, amount: number, type: "credit" | "debit") => {
    const { data: account } = await supabase.from("bank_accounts").select("balance,user_id").eq("id", accountId).single();
    if (!account) throw new Error("Account not found");

    const currentBalance = parseFloat(account.balance as string) || 0;
    const newBalance = type === "credit" ? currentBalance + amount : currentBalance - amount;
    if (type === "debit" && newBalance < 0) throw new Error("Insufficient balance");

    const { error: updErr } = await supabase.from("bank_accounts")
      .update({ balance: newBalance.toFixed(2) })
      .eq("id", accountId);
    if (updErr) throw new Error(updErr.message);

    // Record the transaction
    const { error: txErr } = await supabase.from("transactions").insert({
      user_id: account.user_id,
      from_account_id: accountId,
      type: type === "credit" ? "deposit" : "withdrawal",
      amount: amount.toFixed(2),
      description: `Admin ${type}: ${amount.toFixed(2)}`,
      status: "completed",
    });
    if (txErr) throw new Error(txErr.message);
  }, []);

  const toggleAccount = useCallback(async (accountId: number, isActive: boolean) => {
    const { error: err } = await supabase.from("bank_accounts").update({ is_active: !isActive }).eq("id", accountId);
    if (err) throw new Error(err.message);
  }, []);

  return { accounts, isLoading, fetchAccounts, updateBalance, toggleAccount };
}
