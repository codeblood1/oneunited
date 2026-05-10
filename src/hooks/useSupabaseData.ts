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
    recipientBankId,
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

      const fromAcc = await supabase.from("bank_accounts").select("balance").eq("id", fromAccountId).single();
      if (!fromAcc.data) throw new Error("Source account not found");
      if (parseFloat(fromAcc.data.balance as string) < parseFloat(amount)) {
        throw new Error("Insufficient balance");
      }

      const { error: err } = await supabase.from("transactions").insert({
        user_id: userRow.id,
        from_account_id: fromAccountId,
        type: "transfer",
        amount,
        description: description || `Transfer to ${toAccountNumber}`,
        status: "pending",
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
// FILE UPLOAD
// ============================================================
export async function uploadKycDocument(file: File, type: "front" | "back") {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error("Not authenticated");

  const fileExt = file.name.split(".").pop() || "jpg";
  const fileName = `kyc/${userData.user.id}/${type}_${Date.now()}.${fileExt}`;

  const { error: uploadErr } = await supabase.storage
    .from("documents")
    .upload(fileName, file, { contentType: file.type });

  if (uploadErr) throw uploadErr;

  const { data: { publicUrl } } = supabase.storage.from("documents").getPublicUrl(fileName);
  return publicUrl;
}

export async function uploadAvatar(file: File) {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error("Not authenticated");

  const fileExt = file.name.split(".").pop() || "jpg";
  const fileName = `avatars/${userData.user.id}.${fileExt}`;

  const { error: uploadErr } = await supabase.storage
    .from("documents")
    .upload(fileName, file, { contentType: file.type, upsert: true });

  if (uploadErr) throw uploadErr;

  const { data: { publicUrl } } = supabase.storage.from("documents").getPublicUrl(fileName);

  // Update user avatar
  const { data: userRow } = await supabase.from("users").select("id").eq("supabase_uid", userData.user.id).single();
  if (userRow) {
    await supabase.from("users").update({ avatar: publicUrl }).eq("id", userRow.id);
  }

  return publicUrl;
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
