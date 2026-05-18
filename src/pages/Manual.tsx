import { ArrowLeft, BookOpen, Search, Store, ShoppingBag, Shield, Mail, Package, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Manual() {
  const navigate = useNavigate();

  return (
    <div className="bg-white min-h-screen">
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-neutral-100 px-4 h-16 flex items-center gap-4 pt-safe box-content">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-neutral-100 rounded-full transition-colors">
          <ArrowLeft className="w-6 h-6 text-neutral-600" />
        </button>
        <h1 className="font-black text-xl text-neutral-800 flex-1">
          Manual de Usuario
        </h1>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-12">
        {/* Intro */}
        <section className="text-center space-y-4">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <BookOpen className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-black text-neutral-800">¡Bienvenido a VeciMarket!</h2>
          <p className="text-lg text-neutral-500 font-medium max-w-2xl mx-auto leading-relaxed">
            VeciMarket nació para ayudar a organizar nuestro mercado local dentro del condominio. 
            A diferencia de un chat de WhatsApp o un feed infinito donde los anuncios se duplican, pierden o quedan sepultados, 
            aquí todo está organizado para que encuentres lo que buscas y vendas lo que ofreces de una forma permanente y ordenada.
          </p>
        </section>

        <div className="grid gap-6">
          {/* Buying */}
          <div className="bg-neutral-50 rounded-[32px] p-8 border border-neutral-100 hover:border-emerald-100 transition-colors">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-500 flex items-center justify-center shrink-0">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-neutral-800">¿Cómo buscar o comprar?</h3>
            </div>
            <p className="text-neutral-600 leading-relaxed mb-4">
              Ve a la sección de <strong>Buscar</strong> para explorar todas las categorías disponibles (comida, servicios, artículos y mucho más). Puedes filtrar por lo más reciente o lo mejor calificado.
            </p>
            <ul className="space-y-2 text-neutral-600">
              <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Clic en un anuncio para ver detalles, fotos y precios.</li>
              <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Haz clic en "Realizar Pedido" para enviar un mensaje directo al vendedor.</li>
              <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Podrás hacerle seguimiento desde tu Bandeja de Mensajes.</li>
            </ul>
          </div>

          {/* Selling */}
          <div className="bg-neutral-50 rounded-[32px] p-8 border border-neutral-100 hover:border-emerald-100 transition-colors">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-500 flex items-center justify-center shrink-0">
                <Store className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-neutral-800">¿Cómo ofrecer tus productos/servicios?</h3>
            </div>
            <p className="text-neutral-600 leading-relaxed mb-4">
              Como vendedor, ya no necesitas "subir" tu anuncio cada tres horas. Publícalo una sola vez y mantenlo actualizado.
            </p>
            <ul className="space-y-2 text-neutral-600">
              <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Ve a <strong>Vender / Mis Anuncios</strong> y presiona "Nuevo Anuncio".</li>
              <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Agrega fotos, precio y una descripción clara.</li>
              <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Si es un producto único y ya lo vendiste, podrás usar el botón <strong>Eliminar</strong>.</li>
              <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Si es un negocio permanente, solo edítalo cuando necesites cambiar algo.</li>
            </ul>
          </div>

          {/* Safety & Reports */}
          <div className="bg-neutral-50 rounded-[32px] p-8 border border-neutral-100 hover:border-emerald-100 transition-colors">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 text-red-500 flex items-center justify-center shrink-0">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-neutral-800">Seguridad y Confianza</h3>
            </div>
            <p className="text-neutral-600 leading-relaxed mb-4">
              Este es un espacio de vecinos para vecinos. La confianza y el respeto son nuestra prioridad.
            </p>
            <ul className="space-y-2 text-neutral-600 mb-4">
              <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Valida que estás hablando con un vecino registrado.</li>
              <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Revisa las calificaciones que otros usuarios dejan.</li>
            </ul>
            <div className="bg-white p-4 rounded-2xl text-sm text-neutral-600 border border-neutral-200">
              <strong>¿Problemas con algún anuncio o usuario?</strong> <br/>
              Ahora puedes usar el botón de <span className="text-red-500 font-bold">Reportar</span> que aparece en cada anuncio para alertar a administración sobre contenido falso, ofensivo o situaciones extrañas.
            </div>
          </div>
        </div>

        {/* Footer info */}
        <section className="bg-emerald-50 rounded-[32px] p-8 text-center mt-12 border border-emerald-100">
          <Heart className="w-8 h-8 text-emerald-500 mx-auto mb-4" />
          <h3 className="text-xl font-black text-emerald-900 mb-2">¡Queremos escucharte!</h3>
          <p className="text-emerald-700 mb-6 font-medium">
            ¿Necesitas que agreguemos una nueva categoría? ¿Tienes alguna sugerencia para mejorar la comunidad o requieres soporte?
          </p>
          <a href="mailto:ecolaj@gmail.com" className="inline-flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-2xl font-bold shadow-sm hover:scale-105 transition-transform hover:bg-emerald-700">
            <Mail className="w-5 h-5" />
            Escríbeme a ecolaj@gmail.com
          </a>
        </section>

      </div>
    </div>
  );
}
