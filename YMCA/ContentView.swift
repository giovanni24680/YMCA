import SwiftUI

struct ContentView: View {
    @State private var showApp = false
    @State private var logoOpacity: Double = 0
    @State private var logoScale: CGFloat = 0.88

    private let brandDark = Color(red: 0.102, green: 0.071, blue: 0.063)
    private let brandGold = Color(red: 0.855, green: 0.659, blue: 0.251)
    private let brandBronze = Color(red: 0.761, green: 0.459, blue: 0.227)
    private let brandPaper = Color(red: 0.961, green: 0.925, blue: 0.878)

    var body: some View {
        ZStack {
            brandDark.ignoresSafeArea()

            if !showApp {
                splashView
                    .transition(.opacity)
            }

            if showApp {
                WebAppView()
                    .ignoresSafeArea()
                    .transition(.opacity)
            }
        }
        .onAppear {
            withAnimation(.easeOut(duration: 0.8)) {
                logoOpacity = 1
                logoScale = 1
            }
            DispatchQueue.main.asyncAfter(deadline: .now() + 1.8) {
                withAnimation(.easeInOut(duration: 0.6)) {
                    showApp = true
                }
            }
        }
    }

    private var splashView: some View {
        VStack(spacing: 16) {
            Spacer()

            VStack(spacing: 10) {
                Text("Oulm")
                    .font(.system(size: 52, weight: .bold, design: .serif))
                    .foregroundColor(brandPaper)
                    .tracking(3)

                Rectangle()
                    .fill(
                        LinearGradient(
                            colors: [brandBronze.opacity(0), brandBronze, brandGold, brandBronze.opacity(0)],
                            startPoint: .leading,
                            endPoint: .trailing
                        )
                    )
                    .frame(width: 80, height: 1.5)

                Text("by One YMCA")
                    .font(.system(size: 13, weight: .medium, design: .monospaced))
                    .foregroundColor(brandPaper.opacity(0.45))
                    .tracking(2)
                    .textCase(.uppercase)
            }
            .scaleEffect(logoScale)
            .opacity(logoOpacity)

            Spacer()

            Text("Hertfordshire · Bedfordshire · Buckinghamshire")
                .font(.system(size: 9, weight: .medium, design: .monospaced))
                .foregroundColor(brandPaper.opacity(0.25))
                .tracking(1.5)
                .textCase(.uppercase)
                .opacity(logoOpacity)
                .padding(.bottom, 40)
        }
    }
}

#Preview {
    ContentView()
}
