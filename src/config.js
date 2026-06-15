// =============================================================
//  CONFIGURACAO CENTRAL - PRO LIMPEE
//  Ajuste aqui os dados de contato. Todo o site le deste arquivo.
// =============================================================

export const CONTACT = {
  // Telefone para ligacao (somente digitos com DDD). Ex: "5599999999999"
  // TODO: substituir pelo numero real da Pro Limpee
  phone: "5500000000000",
  phoneDisplay: "(00) 00000-0000",

  // WhatsApp (somente digitos, com codigo do pais 55). Ex: "5599999999999"
  // TODO: substituir pelo numero real
  whatsapp: "5500000000000",
  whatsappMessage:
    "Ola! Vim pelo site e gostaria de um orcamento para limpeza de vidros.",

  email: "contato@prolimpee.com.br", // TODO: confirmar e-mail
  instagram: "https://www.instagram.com/prolimpee/",
  instagramHandle: "@prolimpee",

  // Regiao atendida (aparece no rodape e no contato)
  serviceArea: "Atendimento residencial, comercial e predial",
};

export function whatsappLink(customMessage) {
  const msg = encodeURIComponent(customMessage || CONTACT.whatsappMessage);
  return `https://wa.me/${CONTACT.whatsapp}?text=${msg}`;
}

export function phoneLink() {
  return `tel:+${CONTACT.phone}`;
}
