const auth = 'Basic ' + Buffer.from('Admin:DcuLQnGbj3gRYZRWxiZGHCAf').toString('base64');
const baseUrl = 'https://zapmonei.com.br/wp-json/wp/v2';

async function createTemplate() {
  const templateData = [
    {
      "id": "hero_section",
      "elType": "section",
      "settings": {
        "background_background": "classic",
        "background_color": "#0a0a0a",
        "padding": { "unit": "px", "top": "100", "right": "0", "bottom": "100", "left": "0", "isLinked": false }
      },
      "elements": [
        {
          "id": "hero_container",
          "elType": "column",
          "settings": { "width": { "unit": "%", "size": 60 } },
          "elements": [
            {
              "id": "hero_badge",
              "elType": "widget",
              "widgetType": "heading",
              "settings": {
                "title": "💰 INTELIGÊNCIA FINANCEIRA PELO WHATSAPP",
                "header_size": "div",
                "style_color": "#CCFF00",
                "typography_typography": "custom",
                "typography_font_size": { "unit": "px", "size": 14 },
                "typography_font_weight": "bold",
                "typography_text_transform": "uppercase"
              }
            },
            {
              "id": "hero_title",
              "elType": "widget",
              "widgetType": "heading",
              "settings": {
                "title": "Assuma o Controle Total do seu Dinheiro.",
                "header_size": "h1",
                "style_color": "#ffffff",
                "typography_typography": "custom",
                "typography_font_size": { "unit": "px", "size": 64 },
                "typography_line_height": { "unit": "em", "size": 1.1 },
                "typography_font_weight": "900"
              }
            },
            {
              "id": "hero_description",
              "elType": "widget",
              "widgetType": "text-editor",
              "settings": {
                "editor": "O ZapMonei é o seu novo Agente de Inteligência Financeira. Registre gastos, acompanhe metas e receba relatórios instantâneos sem precisar sair da conversa.",
                "style_color": "#cccccc",
                "typography_typography": "custom",
                "typography_font_size": { "unit": "px", "size": 18 }
              }
            },
            {
              "id": "hero_button",
              "elType": "widget",
              "widgetType": "button",
              "settings": {
                "text": "Ativar meu Agente agora",
                "link": { "url": "https://zapmonei.com.br/checkout/?add-to-cart=21" },
                "align": "left",
                "typography_typography": "custom",
                "typography_font_weight": "bold",
                "background_color": "#CCFF00",
                "color": "#0a0a0a",
                "border_radius": { "unit": "px", "size": 10 },
                "padding": { "unit": "px", "top": "20", "right": "40", "bottom": "20", "left": "40", "isLinked": true }
              }
            }
          ]
        },
        {
          "id": "hero_image_col",
          "elType": "column",
          "settings": { "width": { "unit": "%", "size": 40 } },
          "elements": [
            {
              "id": "hero_main_img",
              "elType": "widget",
              "widgetType": "image",
              "settings": {
                "image": { "url": "https://zapmonei.com.br/wp-content/uploads/2026/05/zapmonei_hero_driver_1778630506684.jpg" }
              }
            }
          ]
        }
      ]
    }
  ];

  const payload = {
    title: 'ZapMonei Elite Funnel - Plano Mensal',
    status: 'publish',
    type: 'elementor_library',
    meta: {
      _elementor_template_type: 'product',
      _elementor_edit_mode: 'builder',
      _elementor_data: JSON.stringify(templateData)
    }
  };

  try {
    const response = await fetch(`${baseUrl}/elementor_library`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': auth
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    console.log('API Response:', JSON.stringify(result, null, 2));
    if (result.id) {
      console.log('Template created with ID:', result.id);
    }
    return result.id;
  } catch (error) {
    console.error('Error creating template:', error);
  }
}

createTemplate();
