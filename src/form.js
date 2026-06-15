// =============================================================
//  FORMULARIO DE ORCAMENTO -> Supabase (tabela "leads")
//  Se o Supabase nao estiver configurado, cai no fallback de
//  abrir o WhatsApp com a mensagem ja preenchida.
// =============================================================

import { createClient } from "@supabase/supabase-js";
import { whatsappLink } from "./config.js";

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabase =
  url && key && !url.includes("SEU-PROJETO") ? createClient(url, key) : null;

export function initForm() {
  const form = document.querySelector("#orcamento-form");
  if (!form) return;

  const statusEl = form.querySelector(".form-status");
  const submitBtn = form.querySelector("button[type='submit']");
  const btnLabel = submitBtn.textContent;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    statusEl.textContent = "";
    statusEl.className = "form-status";

    const data = {
      nome: form.nome.value.trim(),
      telefone: form.telefone.value.trim(),
      servico: form.servico.value,
      mensagem: form.mensagem.value.trim(),
    };

    // Validacao simples
    if (!data.nome || !data.telefone) {
      statusEl.textContent = "Por favor, preencha nome e telefone.";
      statusEl.classList.add("is-error");
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "Enviando...";

    const waMessage =
      `Ola! Sou ${data.nome}.\n` +
      `Servico: ${data.servico}.\n` +
      `${data.mensagem ? data.mensagem + "\n" : ""}` +
      `Telefone: ${data.telefone}`;

    try {
      if (supabase) {
        const { error } = await supabase.from("leads").insert([
          {
            nome: data.nome,
            telefone: data.telefone,
            servico: data.servico,
            mensagem: data.mensagem || null,
            origem: "landing",
          },
        ]);
        if (error) throw error;

        statusEl.textContent =
          "Pedido recebido! Vamos te chamar no WhatsApp em instantes.";
        statusEl.classList.add("is-ok");
        form.reset();

        // Abre o WhatsApp para acelerar o contato
        setTimeout(() => {
          window.open(whatsappLink(waMessage), "_blank", "noopener");
        }, 800);
      } else {
        // Fallback sem backend: leva direto ao WhatsApp
        statusEl.textContent = "Abrindo o WhatsApp para finalizar seu pedido...";
        statusEl.classList.add("is-ok");
        window.open(whatsappLink(waMessage), "_blank", "noopener");
        form.reset();
      }
    } catch (err) {
      console.error(err);
      statusEl.textContent =
        "Nao foi possivel enviar agora. Toque para falar no WhatsApp.";
      statusEl.classList.add("is-error");
      window.open(whatsappLink(waMessage), "_blank", "noopener");
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = btnLabel;
    }
  });
}
